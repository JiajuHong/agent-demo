"""Session 辅助工具，负责时间戳生成、元数据构造与状态映射。"""

from datetime import datetime
from pathlib import Path
from typing import Optional

from app.models import SessionState

from app.prompts import SOFTWARE_FACTORY_PROMPT


def local_now() -> str:
    """统一生成本地时区时间戳。"""
    return datetime.now().astimezone().isoformat()


def build_session_metadata(
    session_id: str,
    *,
    title: Optional[str] = None,
    user_id: Optional[str] = None,
    system_prompt: Optional[str] = None,
    created_at: Optional[str] = None,
) -> dict:
    """构造会话元数据，作为持久化与前端展示的共同来源。"""
    now = local_now()
    return {
        "public_session_id": session_id,
        "title": (title or "新对话").strip() or "新对话",
        "title_source": "user" if (title and title.strip()) else "default",
        "user_id": user_id,
        "system_prompt": system_prompt or SOFTWARE_FACTORY_PROMPT,
        "created_at": created_at or now,
        "updated_at": now,
        "total_tokens": 0,
        "total_steps": 0,
        "duration_seconds": 0,
    }


def to_session_state(doc: dict) -> SessionState:
    """把底层持久化文档转换成控制器可直接返回的会话对象。"""
    metadata = doc.get("metadata", {})
    filepath = doc.get("filepath", "")
    session_id = (
        metadata.get("public_session_id")
        or (Path(filepath).stem if filepath else None)
        or doc.get("session_id")
    )
    history_count = doc.get("history_count")
    if history_count is None:
        history_count = len(doc.get("history", []))

    return SessionState(
        session_id=session_id,
        user_id=metadata.get("user_id"),
        title=metadata.get("title") or "新对话",
        system_prompt=metadata.get("system_prompt", SOFTWARE_FACTORY_PROMPT),
        created_at=doc.get("created_at") or metadata.get("created_at") or local_now(),
        updated_at=doc.get("saved_at") or metadata.get("updated_at") or doc.get("created_at") or local_now(),
        history_count=history_count,
    )
