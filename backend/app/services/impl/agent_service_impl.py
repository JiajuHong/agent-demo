"""Agent 应用服务实现，负责代理运行时的生命周期管理与缓存。"""

from __future__ import annotations

from threading import RLock
from typing import Any, AsyncGenerator, Optional

from app.agents import CodeGenAgent
from hello_agents import Config, ReActAgent
from hello_agents.core import Agent
from hello_agents.core.llm import HelloAgentsLLM
from hello_agents.core.streaming import StreamEvent
from hello_agents.tools.registry import ToolRegistry

from app.prompts import SOFTWARE_FACTORY_PROMPT
from app.repositories import SessionRepository
from app.services.agent_service import AgentService
from app.services.helpers import session_helper


class AgentServiceImpl(AgentService):
    """代理运行时管理的核心服务实现。"""

    def __init__(
        self,
        repository: SessionRepository,
        llm: HelloAgentsLLM,
    ) -> None:
        self._repository = repository
        self._llm = llm
        self._agents: dict[str, Any] = {}
        self._lock = RLock()

    def _create_agent(self, system_prompt: str, session_id: str) -> ReActAgent:
        """创建一个新的代码生成 Agent 实例。"""
        from hello_agents.tools.builtin import ReadTool, WriteTool, EditTool

        project_root = f"generated/{session_id}"

        config = Config(
            stream_enabled=True,
            trace_enabled=True,
            skills_enabled=False,
            subagent_enabled=False,
            todowrite_enabled=False,
            devlog_enabled=False,
            session_enabled=True,
        )
        registry = ToolRegistry()
        registry.register_tool(ReadTool(project_root=project_root))
        registry.register_tool(WriteTool(project_root=project_root))
        registry.register_tool(EditTool(project_root=project_root))

        return CodeGenAgent(
            name="codegen-agent",
            llm=self._llm,
            config=config,
            tool_registry=registry,
            system_prompt=system_prompt or SOFTWARE_FACTORY_PROMPT,
            max_steps=100
        )

    def _get_or_create_agent(self, doc: dict) -> Agent:
        """优先复用内存中的 agent，缺失时再从持久化数据恢复。"""
        metadata = doc.get("metadata", {})
        session_id = (
            metadata.get("public_session_id")
            or doc.get("session_id")
        )

        if session_id in self._agents:
            return self._agents[session_id]

        system_prompt = metadata.get("system_prompt", SOFTWARE_FACTORY_PROMPT)
        agent = self._create_agent(system_prompt, session_id)

        session_path = self._repository.session_path(session_id)
        if session_path.exists():
            agent.load_session(str(session_path), check_consistency=False)

        self._agents[session_id] = agent
        return agent

    def _persist_snapshot(self, session_id: str, agent: Any, metadata: dict) -> dict:
        """保存当前 agent 快照，并重新读取最新文档。"""
        payload = {
            **metadata,
            "public_session_id": session_id,
            "updated_at": session_helper.local_now(),
        }
        agent._session_metadata = payload
        filepath = agent.save_session(session_id)
        return self._repository.load_from_path(filepath)

    def _persist_history(self, session_id: str, agent: Any) -> Optional[dict]:
        """用当前 agent 历史覆盖底层持久化内容。"""
        doc = self._repository.load(session_id)
        if doc is None:
            return None
        return self._persist_snapshot(session_id, agent, doc.get("metadata", {}))

    def get_agent(self, session_id: str) -> Any:
        """根据会话 ID 加载并缓存代理。"""
        with self._lock:
            doc = self._repository.load(session_id)
            if doc is None:
                return None
            return self._get_or_create_agent(doc)

    def save_agent_history(self, session_id: str, agent: Any) -> None:
        """保存代理状态到持久化层。"""
        with self._lock:
            self._persist_history(session_id, agent)

    def get_history(self, session_id: str) -> Optional[list[dict]]:
        """获取并格式化代理历史记录。"""
        with self._lock:
            agent = self._agents.get(session_id)
            if agent is not None:
                return [
                    {
                        "role": msg.role,
                        "content": msg.content,
                        "metadata": msg.metadata if hasattr(msg, 'metadata') else None
                    }
                    for msg in agent.get_history()
                ]

            doc = self._repository.load(session_id)
            if doc is None:
                return None

            return [
                {
                    "role": item.get("role", "assistant"),
                    "content": item.get("content", ""),
                    "metadata": item.get("metadata")
                }
                for item in doc.get("history", [])
            ]

    def clear_history(self, session_id: str) -> bool:
        """重置会话的历史记录。"""
        with self._lock:
            doc = self._repository.load(session_id)
            if doc is None:
                return False
            agent = self._agents.get(session_id) or self._get_or_create_agent(doc)
            agent.clear_history()
            metadata = {
                **doc.get("metadata", {}),
                "updated_at": session_helper.local_now(),
                "public_session_id": session_id,
            }
            self._persist_snapshot(session_id, agent, metadata)
            return True

    def remove_agent_cache(self, session_id: str) -> None:
        """清理内存中的代理缓存。"""
        with self._lock:
            self._agents.pop(session_id, None)

    def run(self, session_id: str, user_message: str) -> Optional[str]:
        """执行一次非流式对话并持久化结果。"""
        agent = self.get_agent(session_id)
        if agent is None:
            return None

        answer = agent.run(user_message)
        self.save_agent_history(session_id, agent)

        return answer

    async def stream(
        self,
        session_id: str,
        user_message: str,
    ) -> AsyncGenerator[StreamEvent, None]:
        """执行一次流式对话并在结束后写回会话快照。

        Args:
            session_id: 会话 ID
            user_message: 用户消息
        """
        agent = self.get_agent(session_id)
        if agent is None:
            raise KeyError("Session not found")

        async for event in agent.arun_stream(user_message):
            yield event

        self.save_agent_history(session_id, agent)
