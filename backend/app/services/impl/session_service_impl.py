"""Session 应用服务实现，仅负责元数据管理与持久化。"""

from __future__ import annotations

from typing import Optional
from uuid import uuid4

from app.models import SessionState
from app.repositories import SessionRepository
from app.services.helpers import session_helper
from app.services.session_service import SessionService
from hello_agents import Config, SimpleAgent
from hello_agents.core.llm import HelloAgentsLLM


class SessionServiceImpl(SessionService):
    """纯粹的会话管理服务实现。"""

    def __init__(
        self,
        repository: SessionRepository,
        llm: HelloAgentsLLM,
    ) -> None:
        self._repository = repository
        self._llm = llm

    def create_session(
        self,
        user_id: Optional[str],
        system_prompt: Optional[str] = None,
        title: Optional[str] = None,
    ) -> SessionState:
        """创建并初始化会话元数据。"""
        session_id = str(uuid4())
        metadata = session_helper.build_session_metadata(
            session_id,
            title=title,
            user_id=user_id,
            system_prompt=system_prompt,
        )

        doc = {
            "session_id": session_id,
            "metadata": metadata,
            "created_at": metadata["created_at"],
            "agent_config": {},
            "history": [],
            "tool_schema_hash": "",
            "read_cache": {},
        }

        self._repository.save(session_id, doc)
        return session_helper.to_session_state(doc)

    def _create_title_agent(self) -> SimpleAgent:
        """创建一个用于生成标题的临时 Agent。"""
        config = Config(
            stream_enabled=False,
            trace_enabled=False,
            skills_enabled=False,
            subagent_enabled=False,
            todowrite_enabled=False,
            devlog_enabled=False,
            session_enabled=False,
        )
        return SimpleAgent(
            name="title-generator",
            llm=self._llm,
            config=config,
            enable_tool_calling=False,
            system_prompt=(
                "你是一个专门生成对话标题的助手。"
                "只输出标题文字（5到10个汉字），不含标点、引号或解释。"
            ),
        )

    def generate_title(self, session_id: str, history: list[dict]) -> Optional[str]:
        """基于对话历史自动生成会话标题。"""
        if not history:
            return None

        context_parts: list[str] = []
        for msg in history[:6]:
            role = msg.get("role", "")
            content = (msg.get("content") or "").strip()[:300]
            if role == "user" and content:
                context_parts.append(f"用户：{content}")
            elif role == "assistant" and content:
                context_parts.append(f"助手：{content}")

        if not context_parts:
            return None

        context_str = "\n".join(context_parts)
        title_prompt = (
            f"根据以下对话内容，用5到10个字生成一个简洁的中文标题，"
            f"只输出标题文字，不加标点、引号或任何解释：\n\n{context_str}"
        )

        try:
            title_agent = self._create_title_agent()
            raw_title = title_agent.run(title_prompt)
            title = (
                (raw_title or "")
                .strip()
                .strip('"\'「」【】《》\u201c\u201d\u2018\u2019')
                .strip()
            )
            if len(title) > 20:
                title = title[:20]
            if not title:
                return None

            return title
        except Exception:
            return None

    def list_sessions(self) -> list[dict]:
        """返回按更新时间倒序排列的会话列表摘要。"""
        sessions = []
        for doc in self._repository.list_all():
            state = session_helper.to_session_state(doc)
            sessions.append({
                "session_id": state.session_id,
                "user_id": state.user_id,
                "title": state.title,
                "created_at": state.created_at,
                "updated_at": state.updated_at,
                "history_count": state.history_count,
            })
        sessions.sort(key=lambda item: item.get("updated_at") or "", reverse=True)
        return sessions

    def get_session(self, session_id: str) -> Optional[SessionState]:
        """按 ID 查询单个会话摘要。"""
        doc = self._repository.load(session_id)
        if doc is None:
            return None
        return session_helper.to_session_state(doc)

    def delete_session(self, session_id: str) -> bool:
        """从仓储中永久移除会话。"""
        return self._repository.delete(session_id)

    def rename_session(self, session_id: str, title: str) -> Optional[SessionState]:
        """更新会话标题。"""
        clean_title = title.strip()
        if not clean_title:
            raise ValueError("Session title cannot be empty")

        doc = self._repository.load(session_id)
        if doc is None:
            return None

        metadata = doc.get("metadata", {})
        metadata.update({
            "title": clean_title,
            "title_source": "user",
            "updated_at": session_helper.local_now(),
        })
        doc["metadata"] = metadata

        self._repository.save(session_id, doc)
        return session_helper.to_session_state(doc)
