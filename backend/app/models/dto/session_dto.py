"""Session API request DTOs."""

from pydantic import BaseModel


class CreateSessionRequestDTO(BaseModel):
    """创建会话请求 DTO。"""

    user_id: str | None = None
    system_prompt: str | None = None
    title: str | None = None


class RenameSessionRequestDTO(BaseModel):
    """重命名会话请求 DTO。"""

    title: str
