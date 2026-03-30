"""基于 HelloAgents SessionStore 的文件仓储实现。"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Optional
from hello_agents import Config
from hello_agents.core.session_store import SessionStore

from app.repositories.session_repository import SessionRepository


class FileSessionRepository(SessionRepository):
    """当前默认仓储实现，按 JSON 文件读写会话。"""

    def __init__(self) -> None:
        self._session_dir = Path(Config().session_dir)
        self._session_dir.mkdir(parents=True, exist_ok=True)
        self._session_store = SessionStore()

    def session_path(self, session_id: str) -> Path:
        """返回会话文件路径，供运行时加载或保存使用。"""

        return self._session_dir / f"{session_id}.json"

    def load(self, session_id: str) -> Optional[dict]:
        """按会话 ID 读取持久化文档，不存在时返回 None。"""

        path = self.session_path(session_id)
        if not path.exists():
            return None
        doc = self._session_store.load(str(path))
        doc["filepath"] = str(path)
        return doc

    def load_from_path(self, filepath: str | Path) -> dict:
        """按完整文件路径读取持久化文档。"""

        doc = self._session_store.load(str(filepath))
        doc["filepath"] = str(filepath)
        return doc

    def list_all(self) -> list[dict]:
        """遍历所有会话文件并忽略损坏或不兼容的旧数据。"""

        sessions: list[dict] = []
        for item in self._session_store.list_sessions():
            try:
                sessions.append(self.load_from_path(item["filepath"]))
            except Exception:
                continue
        return sessions

    def delete(self, session_id: str) -> bool:
        """删除指定会话文件。"""

        return self._session_store.delete(session_id)

    def save(self, session_id: str, doc: dict) -> str:
        """保存或更新会话文件。"""

        path = self.session_path(session_id)
        path.write_text(json.dumps(doc, ensure_ascii=False, indent=2), encoding="utf-8")
        return str(path)
