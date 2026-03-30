"""Agent Service 抽象定义，负责代理的加载、缓存与状态持久化。"""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any, AsyncGenerator, Optional

from hello_agents.core.streaming import StreamEvent


class AgentService(ABC):
    """代理应用服务抽象。"""

    @abstractmethod
    def get_agent(self, session_id: str) -> Any:
        """加载或从缓存中获取代理实例。"""
        raise NotImplementedError

    @abstractmethod
    def save_agent_history(self, session_id: str, agent: Any) -> None:
        """持久化代理当前的历史状态。"""
        raise NotImplementedError

    @abstractmethod
    def get_history(self, session_id: str) -> Optional[list[dict]]:
        """获取代理历史（优先从内存缓存中获取）。"""
        raise NotImplementedError

    @abstractmethod
    def clear_history(self, session_id: str) -> bool:
        """清空代理历史记录。"""
        raise NotImplementedError

    @abstractmethod
    def remove_agent_cache(self, session_id: str) -> None:
        """清理内存中的代理缓存。"""
        raise NotImplementedError

    @abstractmethod
    def run(self, session_id: str, user_message: str) -> Optional[str]:
        """执行一次非流式对话。"""
        raise NotImplementedError

    @abstractmethod
    async def stream(self, session_id: str, user_message: str) -> AsyncGenerator[StreamEvent, None]:
        """执行一次流式对话。"""
        raise NotImplementedError