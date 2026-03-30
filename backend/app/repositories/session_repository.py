"""Session 仓储抽象，屏蔽文件或数据库等具体存储实现。"""

from __future__ import annotations

from abc import ABC, abstractmethod
from pathlib import Path
from typing import Optional


class SessionRepository(ABC):
    """会话持久化接口。"""

    @abstractmethod
    def session_path(self, session_id: str) -> Path:
        """返回指定会话在底层存储中的路径标识。"""

        raise NotImplementedError

    @abstractmethod
    def load(self, session_id: str) -> Optional[dict]:
        """按会话 ID 加载原始持久化文档。"""

        raise NotImplementedError

    @abstractmethod
    def load_from_path(self, filepath: str | Path) -> dict:
        """按底层路径加载原始持久化文档。"""

        raise NotImplementedError

    @abstractmethod
    def list_all(self) -> list[dict]:
        """列出所有会话的原始持久化文档。"""

        raise NotImplementedError

    @abstractmethod
    def delete(self, session_id: str) -> bool:
        """删除指定会话。"""

        raise NotImplementedError

    @abstractmethod
    def save(self, session_id: str, doc: dict) -> str:
        """保存或更新会话文档。"""

        raise NotImplementedError
