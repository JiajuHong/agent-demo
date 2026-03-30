"""Chat API request DTOs."""

from pydantic import BaseModel


class ChatRequestDTO(BaseModel):
    """聊天请求 DTO。"""

    session_id: str
    message: str
