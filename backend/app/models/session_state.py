"""Session domain model - service layer data structure without database mapping."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

@dataclass
class SessionState:
    """Service layer domain entity for session state."""

    session_id: str
    user_id: Optional[str]
    title: str
    system_prompt: str
    created_at: str
    updated_at: str
    history_count: int
