"""SessionMessageEntity 与历史消息结构之间的映射。"""

from __future__ import annotations

import json
from datetime import datetime

from app.mappers.session_entity_mapper import SessionEntityMapper
from app.models.entities import SessionMessageEntity


class SessionMessageEntityMapper:
    """负责会话消息实体与历史消息之间的转换。"""

    @staticmethod
    def _to_metadata_dict(item: dict) -> dict:
        metadata = item.get("metadata")
        if isinstance(metadata, dict):
            return metadata
        return {}

    @staticmethod
    def _pick_first_non_empty(*values):
        for value in values:
            if value is None:
                continue
            if isinstance(value, str) and not value.strip():
                continue
            return value
        return None

    @staticmethod
    def to_entities(session_id: str, history: list[dict]) -> list[SessionMessageEntity]:
        rows: list[SessionMessageEntity] = []
        for index, item in enumerate(history, start=1):
            metadata = SessionMessageEntityMapper._to_metadata_dict(item)
            role = str(item.get("role") or "assistant")

            message_id = SessionMessageEntityMapper._pick_first_non_empty(
                item.get("message_id"),
                metadata.get("message_id"),
                metadata.get("id"),
                f"{session_id}-{index}",
            )
            agent_name = SessionMessageEntityMapper._pick_first_non_empty(
                item.get("agent_name"),
                metadata.get("agent_name"),
                metadata.get("agent"),
                "simple-test-agent" if role == "assistant" else None,
            )
            content_type = SessionMessageEntityMapper._pick_first_non_empty(
                item.get("content_type"),
                metadata.get("content_type"),
                "text",
            )

            message_metadata = {
                key: value
                for key, value in item.items()
                if key
                not in {
                    "message_id",
                    "role",
                    "content",
                    "content_type",
                    "agent_name",
                    "created_at",
                    "timestamp",
                }
            }
            if metadata:
                message_metadata["metadata"] = metadata

            created_at = SessionEntityMapper.parse_datetime(
                SessionMessageEntityMapper._pick_first_non_empty(
                    item.get("created_at"),
                    item.get("timestamp"),
                    metadata.get("created_at"),
                    metadata.get("timestamp"),
                )
            ) or datetime.now().astimezone().replace(tzinfo=None)

            timestamp = SessionEntityMapper.parse_datetime(
                SessionMessageEntityMapper._pick_first_non_empty(
                    item.get("timestamp"),
                    item.get("created_at"),
                    metadata.get("timestamp"),
                    metadata.get("created_at"),
                )
            ) or created_at

            rows.append(
                SessionMessageEntity(
                    session_id=session_id,
                    message_id=str(message_id) if message_id is not None else None,
                    seq_no=index,
                    role=role,
                    agent_name=str(agent_name) if agent_name is not None else None,
                    content=item.get("content", ""),
                    content_type=str(content_type),
                    metadata_json=json.dumps(message_metadata, ensure_ascii=False) if message_metadata else None,
                    created_at=created_at,
                    timestamp=timestamp,
                )
            )
        return rows

    @staticmethod
    def from_entities(rows: list[SessionMessageEntity]) -> list[dict]:
        history: list[dict] = []
        for row in rows:
            item = {
                "role": row.role or "assistant",
                "content": row.content or "",
            }
            if row.message_id:
                item["message_id"] = row.message_id
            if row.agent_name:
                item["agent_name"] = row.agent_name
            if row.content_type:
                item["content_type"] = row.content_type
            if row.created_at is not None:
                item["created_at"] = SessionEntityMapper.format_datetime(row.created_at)
            # timestamp 字段直接存储框架所需的消息时间，优先用表中值，回退到 created_at。
            ts = row.timestamp or row.created_at
            if ts is not None:
                item["timestamp"] = SessionEntityMapper.format_datetime(ts)
            if row.metadata_json:
                item.update(json.loads(row.metadata_json))
            history.append(item)
        return history
