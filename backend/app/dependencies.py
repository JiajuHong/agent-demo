"""应用级依赖装配，集中构造可复用的服务实例。"""

import os

from hello_agents import HelloAgentsLLM

from app.repositories import FileSessionRepository, MySQLSessionRepository, SessionRepository
from app.services.agent_service import AgentService
from app.services.impl import AgentServiceImpl, SessionServiceImpl
from app.services.session_service import SessionService


def _build_repository() -> SessionRepository:
    """按环境变量选择会话仓储实现。"""

    backend = os.getenv("SESSION_STORAGE_BACKEND", "file").strip().lower()
    mysql_ready = all(
        os.getenv(key)
        for key in ["MYSQL_HOST", "MYSQL_PORT", "MYSQL_USER", "MYSQL_DATABASE"]
    )

    if backend == "mysql" or (backend == "auto" and mysql_ready):
        return MySQLSessionRepository()
    return FileSessionRepository()


_repository = _build_repository()

_llm = HelloAgentsLLM()

_session_service = SessionServiceImpl(
    repository=_repository,
    llm=_llm
)

_agent_service = AgentServiceImpl(
    repository=_repository,
    llm=_llm
)


def get_session_service() -> SessionService:
    return _session_service


def get_agent_service() -> AgentService:
    return _agent_service


def get_llm() -> HelloAgentsLLM:
    return _llm