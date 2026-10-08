from datetime import datetime, timezone
from sqlalchemy import Integer, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base


class GeminiUsageLog(Base):
    __tablename__ = "gemini_usage_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    requested_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        index=True,
        nullable=False
    )
    feature: Mapped[str] = mapped_column(String(64), default="profile_analysis", nullable=False)

    def __repr__(self) -> str:
        return f"<GeminiUsageLog user_id={self.user_id} at={self.requested_at} feature={self.feature}>"
