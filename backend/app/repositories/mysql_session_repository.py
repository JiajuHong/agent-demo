"""基于 MySQL 的会话仓储实现。"""

from __future__ import annotations

import json
import os
from datetime import datetime
from pathlib import Path
from urllib.parse import quote_plus
from typing import Optional

from hello_agents import Config
from sqlalchemy import create_engine, delete, select, update
from sqlalchemy.orm import Session, sessionmaker

from app.mappers import SessionEntityMapper, SessionMessageEntityMapper
from app.models.entities import SessionEntity, SessionMessageEntity
from app.repositories.session_repository import SessionRepository


class MySQLSessionRepository(SessionRepository):
    """使用 SQLAlchemy ORM 持久化会话与消息。"""

    def __init__(self) -> None:
        self._host = os.getenv("MYSQL_HOST", "127.0.0.1")
        self._port = int(os.getenv("MYSQL_PORT", "3306"))
        self._user = os.getenv("MYSQL_USER", "root")
        self._password = os.getenv("MYSQL_PASSWORD", "")
        self._database = os.getenv("MYSQL_DATABASE", "agents")

        self._cache_dir = Path(Config().session_dir)
        self._cache_dir.mkdir(parents=True, exist_ok=True)

        password = quote_plus(self._password)
        self._engine = create_engine(
            f"mysql+pymysql://{self._user}:{password}@{self._host}:{self._port}/{self._database}?charset=utf8mb4",
            pool_pre_ping=True,
        )
        # 类似 Java 的 SessionFactory：每次仓储方法内部短生命周期打开 DB Session。
        self._session_factory = sessionmaker(bind=self._engine, autoflush=False, autocommit=False)

    # ---- 内部辅助方法：负责「实体 <-> 文档」转换与基础 DB 操作 ----
    def _extract_session_id(self, doc: dict, filepath: str | Path) -> str:
        return SessionEntityMapper.extract_session_id(doc, filepath)

    def _upsert_session(self, db: Session, session_id: str, doc: dict) -> SessionEntity:
        # upsert 主表：有则更新，无则新建。
        row = db.scalar(select(SessionEntity).where(SessionEntity.session_id == session_id))
        if row is None:
            row = SessionEntity(session_id=session_id, title="新对话")
            db.add(row)
        SessionEntityMapper.apply_entity(row, session_id, doc)
        return row

    def _replace_messages(self, db: Session, session_id: str, history: list[dict]) -> None:
        # 简化策略：每次全量覆盖消息表，保证 seq_no 与历史顺序一致。
        db.execute(delete(SessionMessageEntity).where(SessionMessageEntity.session_id == session_id))

        rows = SessionMessageEntityMapper.to_entities(session_id, history)

        if rows:
            db.add_all(rows)

    def _build_doc_from_row(self, row: SessionEntity, history: list[dict], *, include_history: bool) -> dict:
        return SessionEntityMapper.to_doc(row, history, self._cache_dir, include_history=include_history)

    def _fetch_messages(self, session_id: str) -> list[dict]:
        # 读取消息明细时按 seq_no 排序，确保还原出的历史可直接喂给 runtime。
        with self._session_factory() as db:
            rows = db.scalars(
                select(SessionMessageEntity)
                .where(SessionMessageEntity.session_id == session_id)
                .order_by(SessionMessageEntity.seq_no.asc())
            ).all()

        return SessionMessageEntityMapper.from_entities(rows)

    def _get_session_row(self, session_id: str) -> Optional[SessionEntity]:
        # 统一过滤软删除数据，避免上层重复写 deleted_at 条件。
        with self._session_factory() as db:
            return db.scalar(
                select(SessionEntity).where(
                    SessionEntity.session_id == session_id,
                    SessionEntity.deleted_at.is_(None),
                )
            )

    # ---- 对外仓储接口：供 Service 调用 ----
    def session_path(self, session_id: str) -> Path:
        """把数据库中的会话快照同步到本地缓存文件，供运行时加载。"""

        path = self._cache_dir / f"{session_id}.json"
        doc = self.load(session_id)
        if doc is not None:
            path.write_text(json.dumps(doc, ensure_ascii=False), encoding="utf-8")
        return path

    def load(self, session_id: str) -> Optional[dict]:
        # 读路径：主表 + 消息表 -> 映射为统一文档结构。
        row = self._get_session_row(session_id)
        if row is None:
            return None

        history = self._fetch_messages(session_id)
        return self._build_doc_from_row(row, history, include_history=True)

    def load_from_path(self, filepath: str | Path) -> dict:
        # 写路径：runtime 保存 JSON 文件后，这里反向写入 MySQL。
        file_path = Path(str(filepath))
        doc = json.loads(file_path.read_text(encoding="utf-8"))
        session_id = self._extract_session_id(doc, file_path)
        with self._session_factory() as db:
            self._upsert_session(db, session_id, doc)
            self._replace_messages(db, session_id, doc.get("history", []))
            db.commit()
        # 回读一次，统一返回格式并补齐 filepath/history_count。
        return self.load(session_id) or {
            **doc,
            "filepath": str(self._cache_dir / f"{session_id}.json"),
            "history_count": len(doc.get("history", [])),
        }

    def list_all(self) -> list[dict]:
        # 列表只取会话摘要，不加载 history，减少 IO 与序列化成本。
        with self._session_factory() as db:
            rows = db.scalars(
                select(SessionEntity)
                .where(SessionEntity.deleted_at.is_(None))
                .order_by(SessionEntity.updated_at.desc())
            ).all()

        sessions: list[dict] = []
        for row in rows:
            try:
                sessions.append(self._build_doc_from_row(row, [], include_history=False))
            except Exception:
                continue

        return sessions

    def delete(self, session_id: str) -> bool:
        """逻辑删除会话：更新状态并记录删除时间。"""

        with self._session_factory() as db:
            now = datetime.now().astimezone().replace(tzinfo=None)
            result = db.execute(
                update(SessionEntity)
                .where(
                    SessionEntity.session_id == session_id,
                    SessionEntity.deleted_at.is_(None),
                )
                .values(status="deleted", deleted_at=now, updated_at=now)
            )
            db.commit()
            affected = result.rowcount or 0

        cache_file = self._cache_dir / f"{session_id}.json"
        if cache_file.exists():
            # 删除本地缓存，避免后续 runtime 误读旧会话快照。
            cache_file.unlink(missing_ok=True)

        return affected > 0

    def save(self, session_id: str, doc: dict) -> str:
        """保存或更新 MySQL 会话记录，并同步本地缓存文件。"""

        with self._session_factory() as db:
            self._upsert_session(db, session_id, doc)
            self._replace_messages(db, session_id, doc.get("history", []))
            db.commit()

        # 同步本地缓存文件，确保运行时可见。
        path = self.session_path(session_id)
        return str(path)
