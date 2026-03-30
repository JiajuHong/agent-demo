"""SessionEntity 与文档结构之间的映射。"""

from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from typing import Optional

from app.models.entities import SessionEntity


class SessionEntityMapper:
    """负责会话主表实体与仓储文档之间的转换。"""

    @staticmethod
    def parse_datetime(value: object) -> Optional[datetime]:
        if value in (None, ""):
            return None
        if isinstance(value, datetime):
            if value.tzinfo is None:
                return value
            return value.astimezone().replace(tzinfo=None)

        text = str(value).strip()
        if not text:
            return None

        if text.endswith("Z"):
            text = text[:-1] + "+00:00"

        parsed = datetime.fromisoformat(text)
        if parsed.tzinfo is None:
            # 无时区字符串按本地时间解释并原样落库（naive local）。
            return parsed
        return parsed.astimezone().replace(tzinfo=None)

    @staticmethod
    def format_datetime(value: object) -> Optional[str]:
        parsed = SessionEntityMapper.parse_datetime(value)
        if parsed is None:
            return None
        local_tz = datetime.now().astimezone().tzinfo
        return parsed.replace(tzinfo=local_tz).isoformat()

    @staticmethod
    def extract_session_id(doc: dict, filepath: str | Path) -> str:
        metadata = doc.get("metadata", {})
        session_id = metadata.get("public_session_id") or doc.get("session_id")
        if session_id:
            return str(session_id)
        return Path(str(filepath)).stem

    @staticmethod
    def apply_entity(row: SessionEntity, session_id: str, doc: dict) -> None:
        metadata = doc.get("metadata", {})
        history = doc.get("history", [])
        created_at = SessionEntityMapper.parse_datetime(doc.get("created_at") or metadata.get("created_at"))
        updated_at = SessionEntityMapper.parse_datetime(doc.get("saved_at") or metadata.get("updated_at") or created_at)

        row.session_id = session_id
        row.user_id = metadata.get("user_id")
        row.title = metadata.get("title") or "新对话"
        row.system_prompt = metadata.get("system_prompt")
        row.status = metadata.get("status", "active")
        row.message_count = len(history)
        row.last_message_at = updated_at
        row.metadata_json = json.dumps(metadata, ensure_ascii=False)
        row.agent_config_json = json.dumps(doc.get("agent_config", {}), ensure_ascii=False)
        row.tool_schema_hash = doc.get("tool_schema_hash")
        row.read_cache_json = json.dumps(doc.get("read_cache", {}), ensure_ascii=False)
        now_local = datetime.now().astimezone().replace(tzinfo=None)
        row.created_at = created_at or now_local
        row.updated_at = updated_at or now_local
        row.deleted_at = SessionEntityMapper.parse_datetime(metadata.get("deleted_at"))

    @staticmethod
    def to_doc(row: SessionEntity, history: list[dict], cache_dir: Path, *, include_history: bool) -> dict:
        metadata = json.loads(row.metadata_json) if row.metadata_json else {}
        metadata.update(
            {
                "public_session_id": row.session_id,
                "user_id": row.user_id,
                "title": row.title or metadata.get("title") or "新对话",
                "system_prompt": row.system_prompt or metadata.get("system_prompt"),
                "status": row.status or metadata.get("status", "active"),
            }
        )
        if row.deleted_at is not None:
            metadata["deleted_at"] = SessionEntityMapper.format_datetime(row.deleted_at)

        return {
            "session_id": row.session_id,
            "created_at": SessionEntityMapper.format_datetime(row.created_at),
            "saved_at": SessionEntityMapper.format_datetime(row.updated_at),
            "agent_config": json.loads(row.agent_config_json) if row.agent_config_json else {},
            "tool_schema_hash": row.tool_schema_hash or "",
            "read_cache": json.loads(row.read_cache_json) if row.read_cache_json else {},
            "metadata": metadata,
            "history": history if include_history else [],
            "history_count": row.message_count if row.message_count is not None else len(history),
            "filepath": str(cache_dir / f"{row.session_id}.json"),
        }
