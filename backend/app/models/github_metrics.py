from datetime import datetime, timezone
from typing import Dict, Any, TYPE_CHECKING
from sqlalchemy import Integer, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base

if TYPE_CHECKING:
    from app.models.github_account import GitHubAccount


class GitHubMetrics(Base):
    __tablename__ = "github_metrics"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    github_account_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("github_accounts.id", ondelete="CASCADE"), unique=True, index=True, nullable=False
    )
    repository_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_stars: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_forks: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    languages: Mapped[Dict[str, int]] = mapped_column(JSON, default=dict, nullable=False)
    recent_repository_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    active_repository_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    
    calculated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc), 
        nullable=False
    )

    # Relationships
    github_account: Mapped["GitHubAccount"] = relationship("GitHubAccount", back_populates="metrics")

    def __repr__(self) -> str:
        return f"<GitHubMetrics id={self.id} account_id={self.github_account_id}>"
