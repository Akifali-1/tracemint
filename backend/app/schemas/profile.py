from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.analysis import SkillEvidence, StrengthEvidence, NotableProject


class ProfileGenerateRequest(BaseModel):
    force_refresh: bool = False


class DeveloperProfileOut(BaseModel):
    username_slug: str
    summary: str
    skills: List[SkillEvidence]
    strengths: List[StrengthEvidence]
    projects: List[NotableProject]
    insights: List[str]
    metrics: Dict[str, Any]
    is_public: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PublicProfileOut(BaseModel):
    username_slug: str
    display_name: str
    avatar_url: Optional[str] = None
    summary: str
    skills: List[SkillEvidence]
    strengths: List[StrengthEvidence]
    projects: List[NotableProject]
    insights: List[str]
    metrics: Dict[str, Any]
    updated_at: datetime
    is_demo: bool = False
