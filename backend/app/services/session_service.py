"""Session Service 抽象定义，供 controller 依赖。"""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Optional

from app.models import SessionState


class SessionService(ABC):
    """会话应用服务抽象（Java 风格 Service 接口）。"""

    @abstractmethod
    def create_session(
        self,
        user_id: Optional[str],
        system_prompt: Optional[str] = None,
        title: Optional[str] = None,
    ) -> SessionState:
        """创建新会话。"""
        raise NotImplementedError

    @abstractmethod
    def list_sessions(self) -> list[dict]:
        """列出所有会话摘要。"""
        raise NotImplementedError

    @abstractmethod
    def get_session(self, session_id: str) -> Optional[SessionState]:
        """按 ID 获取单个会话状态。"""
        raise NotImplementedError

    @abstractmethod
    def delete_session(self, session_id: str) -> bool:
        """删除指定会话。"""
        raise NotImplementedError

    @abstractmethod
    def rename_session(self, session_id: str, title: str) -> Optional[SessionState]:
        """更新会话标题。"""
        raise NotImplementedError

    @abstractmethod
    def generate_title(self, session_id: str, history: list[dict]) -> Optional[str]:
        """基于对话历史生成会话标题。"""
        raise NotImplementedError
