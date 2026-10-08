import json
import re
from typing import Dict, Any, Optional
import httpx
from app.core.config import settings
from app.core.logging import logger
from app.schemas.analysis import DeterministicEvidence, GeminiAnalysisResult, SkillEvidence, StrengthEvidence, NotableProject

GEMINI_API_URL_TEMPLATE = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"

SYSTEM_PROMPT = """You are TraceMint's developer-profile analysis engine.

Your task is to analyze factual GitHub evidence and generate a concise professional interpretation.

STRICT RULES:
1. Never invent facts.
2. Never invent achievements.
3. Never invent employment history.
4. Never invent awards.
5. Never claim a technology unless supported by the provided evidence.
6. Never claim contribution counts unless explicitly present in the evidence.
7. Do not describe a developer as an expert solely because they used a technology once.
8. Distinguish observed evidence from interpretation.
9. Every skill should have repository evidence.
10. Prefer conservative conclusions over unsupported claims.
11. Do not exaggerate.
12. Do not rank a developer against other developers.
13. Do not infer sensitive personal attributes.
14. Do not infer age, gender, ethnicity, religion, health, political beliefs, or other sensitive characteristics.
15. Return only valid, parseable JSON matching the requested schema without markdown backticks or commentary.

Return exactly this JSON structure:
{
  "summary": "Concise factual summary of observed technical activity",
  "skills": [
    {
      "name": "Language or Framework",
      "confidence": 0.85,
      "evidence": ["repo-name-1", "repo-name-2"]
    }
  ],
  "strengths": [
    {
      "name": "Demonstrated Technical Focus Area",
      "evidence": ["repo-name-1"]
    }
  ],
  "notable_projects": [
    {
      "repository": "repo-name-1",
      "reason": "Specific observed characteristic (e.g. 150 stars, active TypeScript codebase)"
    }
  ],
  "insights": [
    "Factual observation regarding language distribution, activity frequency, or public repositories"
  ]
}
"""


class GeminiClient:
    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.model = model or settings.GEMINI_MODEL

    async def analyze_evidence(self, evidence: DeterministicEvidence) -> GeminiAnalysisResult:
        """Sends deterministic evidence to Gemini and validates the structured response."""
        if not self.api_key or self.api_key.strip() == "":
            logger.warning("GEMINI_API_KEY is not configured. Using deterministic fallback profile generator.")
            return self._generate_deterministic_fallback(evidence)

        evidence_payload = evidence.model_dump()
        user_message = f"Here is the verified GitHub evidence for developer '{evidence.username}':\n\n{json.dumps(evidence_payload, indent=2)}"

        url = GEMINI_API_URL_TEMPLATE.format(model=self.model)
        headers = {
            "Content-Type": "application/json",
            "x-goog-api-key": self.api_key
        }
        
        request_body = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": f"{SYSTEM_PROMPT}\n\n{user_message}"}]
                }
            ],
            "generationConfig": {
                "temperature": 0.2,
                "responseMimeType": "application/json"
            }
        }

        # First attempt
        logger.info(f"Calling Gemini ({self.model}) for user: {evidence.username}")
        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                resp = await self._call_gemini_api(client, url, headers, request_body)
                if resp.status_code == 200:
                    raw_text = self._extract_text(resp.json())
                    parsed = self._parse_and_validate(raw_text)
                    if parsed:
                        return parsed
                else:
                    logger.warning(f"Gemini API returned status {resp.status_code}: {resp.text[:200]}")
            except Exception as e:
                logger.error(f"Gemini API invocation error: {e}")

            # Second attempt: retry with correction prompt
            logger.info("Retrying Gemini with simplified correction prompt...")
            retry_body = {
                "contents": [
                    {
                        "role": "user",
                        "parts": [{"text": f"{SYSTEM_PROMPT}\n\nReturn strictly valid JSON for:\n{user_message}"}]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.1,
                    "responseMimeType": "application/json"
                }
            }
            try:
                retry_resp = await self._call_gemini_api(client, url, headers, retry_body)
                if retry_resp.status_code == 200:
                    raw_text = self._extract_text(retry_resp.json())
                    parsed = self._parse_and_validate(raw_text)
                    if parsed:
                        return parsed
            except Exception as e:
                logger.error(f"Gemini retry failed: {e}")

        logger.warning("Gemini parsing failed or unavailable. Generating verified deterministic fallback.")
        return self._generate_deterministic_fallback(evidence)

    async def _call_gemini_api(self, client: httpx.AsyncClient, url: str, headers: Dict[str, str], body: Dict[str, Any]) -> httpx.Response:
        return await client.post(url, headers=headers, json=body)

    def _extract_text(self, gemini_response: Dict[str, Any]) -> str:
        candidates = gemini_response.get("candidates", [])
        if candidates and "content" in candidates[0]:
            parts = candidates[0]["content"].get("parts", [])
            if parts and "text" in parts[0]:
                return parts[0]["text"]
        return ""

    def _parse_and_validate(self, text: str) -> Optional[GeminiAnalysisResult]:
        if not text:
            return None
        cleaned = text.strip()
        # Strip potential markdown formatting ```json ... ```
        if cleaned.startswith("```"):
            cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
            cleaned = re.sub(r"\s*```$", "", cleaned)
        try:
            data = json.loads(cleaned)
            return GeminiAnalysisResult.model_validate(data)
        except Exception as e:
            logger.warning(f"Failed to validate Gemini response schema: {e}")
            return None

    def _generate_deterministic_fallback(self, evidence: DeterministicEvidence) -> GeminiAnalysisResult:
        """Grounded deterministic fallback generated strictly from verified repository statistics."""
        top_languages = list(evidence.languages.keys())[:5]
        
        skills: list[SkillEvidence] = []
        for lang, count in list(evidence.languages.items())[:6]:
            # Collect repos using this language
            matching_repos = [r["name"] for r in evidence.repositories if r.get("language") == lang][:4]
            confidence = min(0.95, round(0.5 + (count * 0.08), 2))
            skills.append(SkillEvidence(
                name=lang,
                confidence=confidence,
                evidence=matching_repos if matching_repos else [f"{count} repositories"]
            ))

        strengths: list[StrengthEvidence] = []
        if top_languages:
            strengths.append(StrengthEvidence(
                name=f"Primary Ecosystem: {', '.join(top_languages[:3])}",
                evidence=[r["name"] for r in evidence.repositories[:3]]
            ))
        if evidence.total_stars > 0:
            strengths.append(StrengthEvidence(
                name="Community Recognition",
                evidence=[r["name"] for r in evidence.repositories if r.get("stars", 0) > 0][:3]
            ))

        notable_projects: list[NotableProject] = []
        for repo in evidence.repositories[:4]:
            reasons = []
            if repo.get("stars", 0) > 0:
                reasons.append(f"{repo['stars']} stars")
            if repo.get("language"):
                reasons.append(f"{repo['language']}")
            if repo.get("topics"):
                reasons.append(f"topics: {', '.join(repo['topics'][:2])}")
            
            notable_projects.append(NotableProject(
                repository=repo["name"],
                reason=" • ".join(reasons) if reasons else "Active public codebase"
            ))

        summary = (
            f"Developer @{evidence.username} with {evidence.repository_count} public repositories. "
            f"Primary demonstrated language footprint across {', '.join(top_languages) if top_languages else 'open-source projects'} "
            f"with {evidence.total_stars} stars and {evidence.total_forks} forks observed."
        )

        insights = [
            f"Authored code across {len(evidence.languages)} distinct programming languages.",
            f"{evidence.recent_repository_count} repositories actively updated within the last 6 months."
        ]

        return GeminiAnalysisResult(
            summary=summary,
            skills=skills,
            strengths=strengths,
            notable_projects=notable_projects,
            insights=insights
        )
