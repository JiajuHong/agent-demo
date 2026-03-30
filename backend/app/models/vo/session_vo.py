"""Session API response VOs."""

from pydantic import BaseModel


class SessionVO(BaseModel):
    """会话摘要响应 VO。"""

    session_id: str
    user_id: str | None = None
    title: str
    created_at: str
    updated_at: str
    history_count: int


class SessionListVO(BaseModel):
    """会话列表响应 VO。"""

    items: list[dict]
    sessions: list[dict]


class SessionHistoryVO(BaseModel):
    """会话历史响应 VO。"""

    session_id: str
    messages: list[dict]
    history: list[dict]
    history_count: int


class SessionResetVO(BaseModel):
    """会话清空历史响应 VO。"""

    session_id: str
    history_count: int
    message: str


class SessionDeleteVO(BaseModel):
    """会话删除响应 VO。"""

    session_id: str
    deleted: bool


class SessionTitleVO(BaseModel):
    """会话标题响应 VO。"""

    session_id: str
    title: str
