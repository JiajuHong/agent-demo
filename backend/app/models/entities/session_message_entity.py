"""会话消息表 ORM 实体。"""

from __future__ import annotations

import os
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Index, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.models.entities.base import Base

SESSIONS_TABLE = os.getenv("MYSQL_SESSIONS_TABLE", "sessions")
MESSAGES_TABLE = os.getenv("MYSQL_SESSION_MESSAGES_TABLE", "session_messages")


class SessionMessageEntity(Base):
    """对应会话逐条消息表。"""

    __tablename__ = MESSAGES_TABLE

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    session_id: Mapped[str] = mapped_column(
        String(64),
        ForeignKey(f"{SESSIONS_TABLE}.session_id", ondelete="CASCADE"),
        nullable=False,
    )
    message_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    seq_no: Mapped[int] = mapped_column(Integer, nullable=False)
    role: Mapped[str] = mapped_column(String(32), nullable=False)
    agent_name: Mapped[str | None] = mapped_column(String(128), nullable=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    content_type: Mapped[str] = mapped_column(String(32), nullable=False, default="text")
    tool_name: Mapped[str | None] = mapped_column(String(128), nullable=True)
    tool_call_id: Mapped[str | None] = mapped_column(String(128), nullable=True)
    metadata_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())
    timestamp: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    __table_args__ = (
        Index("idx_session_seq", "session_id", "seq_no", unique=True),
        Index("idx_session_created", "session_id", "created_at"),
        Index("idx_role", "role"),
    )
