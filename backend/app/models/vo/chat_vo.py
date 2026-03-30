"""Chat API response VOs."""

from pydantic import BaseModel


class ChatResponseVO(BaseModel):
    """同步问答响应 VO。"""

    session_id: str
    answer: str
    history_count: int
