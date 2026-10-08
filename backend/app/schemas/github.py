from datetime import datetime
from typing import Optional, List, Dict
from pydantic import BaseModel, ConfigDict


class RepositoryOut(BaseModel):
    name: str
    full_name: str
    description: Optional[str] = None
    html_url: str
    language: Optional[str] = None
    stars: int = 0
    forks: int = 0
    topics: List[str] = []
    is_fork: bool = False

    model_config = ConfigDict(from_attributes=True)


class GitHubMetricsOut(BaseModel):
    repository_count: int
    total_stars: int
    total_forks: int
    languages: Dict[str, int]
    recent_repository_count: int
    active_repository_count: int
    calculated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class GitHubStatusResponse(BaseModel):
    connected: bool
    username: Optional[str] = None
    avatar_url: Optional[str] = None
    repository_count: int = 0
    last_synced_at: Optional[datetime] = None


class GitHubSyncResponse(BaseModel):
    status: str = "success"
    message: str
    repositories_synced: int
    metrics: GitHubMetricsOut
