"""Session controller，只处理 HTTP 协议与响应兼容层。"""

import asyncio

from fastapi import APIRouter, Depends, HTTPException

from app.dependencies import get_agent_service, get_session_service
from app.models import SessionState
from app.models.dto import CreateSessionRequestDTO, RenameSessionRequestDTO
from app.models.vo import (
    SessionDeleteVO,
    SessionHistoryVO,
    SessionListVO,
    SessionResetVO,
    SessionTitleVO,
    SessionVO,
)
from app.services.agent_service import AgentService
from app.services.session_service import SessionService

router = APIRouter()


def _serialize_session(state: SessionState) -> SessionVO:
    """将领域对象转换为前端稳定依赖的响应结构。"""

    return SessionVO(
        session_id=state.session_id,
        user_id=state.user_id,
        title=state.title,
        created_at=state.created_at,
        updated_at=state.updated_at,
        history_count=state.history_count,
    )


@router.post("")
async def create_session(
    payload: CreateSessionRequestDTO | None = None,
    session_service: SessionService = Depends(get_session_service),
) -> SessionVO:
    """创建一个新的会话。"""

    request = payload or CreateSessionRequestDTO()
    try:
        state = session_service.create_session(
            user_id=request.user_id,
            system_prompt=request.system_prompt,
            title=request.title,
        )
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    return _serialize_session(state)


@router.get("")
async def list_sessions(session_service: SessionService = Depends(get_session_service)) -> dict:
    """列出所有会话，保留旧前端依赖的字段名。"""

    items = session_service.list_sessions()
    return SessionListVO(items=items, sessions=items).model_dump()


@router.get("/{session_id}")
async def get_session(
    session_id: str,
    session_service: SessionService = Depends(get_session_service),
) -> SessionVO:
    """获取单个会话的摘要信息。"""

    state = session_service.get_session(session_id)
    if state is None:
        raise HTTPException(status_code=404, detail="Session not found")

    return _serialize_session(state)


@router.get("/{session_id}/history")
async def get_session_history(
    session_id: str,
    agent_service: AgentService = Depends(get_agent_service),
) -> dict:
    """获取指定会话的消息历史。"""

    history = agent_service.get_history(session_id)
    if history is None:
        raise HTTPException(status_code=404, detail="Session not found")
    return SessionHistoryVO(
        session_id=session_id,
        messages=history,
        history=history,
        history_count=len(history),
    ).model_dump()


@router.post("/{session_id}/reset")
async def reset_session_history(
    session_id: str,
    agent_service: AgentService = Depends(get_agent_service),
) -> SessionResetVO:
    """清空指定会话的历史消息。"""

    success = agent_service.clear_history(session_id)
    if not success:
        raise HTTPException(status_code=404, detail="Session not found")
    return SessionResetVO(
        session_id=session_id,
        history_count=0,
        message="Session history cleared",
    )


@router.delete("/{session_id}")
async def delete_session(
    session_id: str,
    session_service: SessionService = Depends(get_session_service),
    agent_service: AgentService = Depends(get_agent_service),
) -> SessionDeleteVO:
    """删除指定会话。"""

    deleted = session_service.delete_session(session_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Session not found")

    # 同时清理内存缓存
    agent_service.remove_agent_cache(session_id)

    return SessionDeleteVO(session_id=session_id, deleted=True)


@router.patch("/{session_id}")
async def rename_session(
    session_id: str,
    payload: RenameSessionRequestDTO,
    session_service: SessionService = Depends(get_session_service),
) -> SessionVO:
    """更新指定会话的标题。"""

    try:
        state = session_service.rename_session(session_id, payload.title)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    if state is None:
        raise HTTPException(status_code=404, detail="Session not found")
    return _serialize_session(state)


@router.post("/{session_id}/generate-title")
async def generate_session_title(
    session_id: str,
    agent_service: AgentService = Depends(get_agent_service),
    session_service: SessionService = Depends(get_session_service),
) -> SessionTitleVO:
    """基于对话历史自动生成会话标题，用户手动设置的标题不会被覆盖。"""

    session = session_service.get_session(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")

    history = agent_service.get_history(session_id)
    if not history:
        raise HTTPException(status_code=404, detail="No history available for title generation")

    try:
        title = await asyncio.to_thread(session_service.generate_title, session_id, history)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Title generation failed: {exc}") from exc

    if title is None:
        raise HTTPException(status_code=404, detail="Title generation failed")

    session_service.rename_session(session_id, title)

    return SessionTitleVO(session_id=session_id, title=title)
