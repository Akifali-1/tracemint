from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class SkillEvidence(BaseModel):
    name: str = Field(..., description="Observed language, framework, or tooling supported by repo evidence")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Conservative confidence score between 0.0 and 1.0")
    evidence: List[str] = Field(..., min_length=1, description="Repository names demonstrating this skill")


class StrengthEvidence(BaseModel):
    name: str = Field(..., description="Demonstrated engineering capability (e.g. Distributed Systems, CLI Tooling)")
    evidence: List[str] = Field(..., min_length=1, description="Repository names demonstrating this capability")


class NotableProject(BaseModel):
    repository: str = Field(..., description="Name of the notable repository")
    reason: str = Field(..., description="Factual justification based on code, stars, topic, or complexity")


class GeminiAnalysisResult(BaseModel):
    summary: str = Field(..., description="Concise professional overview grounded purely in provided repository evidence")
    skills: List[SkillEvidence] = Field(default_factory=list, description="Demonstrated skills tied to repository evidence")
    strengths: List[StrengthEvidence] = Field(default_factory=list, description="Observed technical strengths with evidence")
    notable_projects: List[NotableProject] = Field(default_factory=list, description="Highlighted projects with objective reasons")
    insights: List[str] = Field(default_factory=list, description="Factual developer insights and patterns")


class DeterministicEvidence(BaseModel):
    username: str
    repository_count: int
    languages: Dict[str, int]
    total_stars: int
    total_forks: int
    recent_repository_count: int
    active_repository_count: int
    repositories: List[Dict[str, Any]]
