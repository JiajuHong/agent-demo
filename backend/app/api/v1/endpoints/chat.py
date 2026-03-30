"""Chat controller，负责同步问答与 SSE 流式输出。"""

import asyncio

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse

from app.dependencies import get_agent_service, get_session_service
from app.models.dto import ChatRequestDTO
from app.models.vo import ChatResponseVO
from app.services.agent_service import AgentService
from app.services.session_service import SessionService

router = APIRouter()


def _streaming_response(
    agent_service: AgentService,
    session_id: str,
    message: str,
) -> StreamingResponse:
    """把运行时事件转换为浏览器可消费的 SSE 响应。"""

    async def event_generator():
        try:
            yield ": keep-alive\n\n"
            async for event in agent_service.stream(session_id, message):
                yield event.to_sse()
                await asyncio.sleep(0.01)
        except Exception as exc:
            error_sse = f"event: error\ndata: {{\"error\": \"{str(exc)}\"}}\n\n"
            yield error_sse

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream; charset=utf-8",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("/completions")
async def create_chat_completion(
    payload: ChatRequestDTO,
    agent_service: AgentService = Depends(get_agent_service),
    session_service: SessionService = Depends(get_session_service),
) -> ChatResponseVO:
    """执行一次非流式问答。"""

    try:
        answer = await asyncio.to_thread(
            agent_service.run,
            payload.session_id,
            payload.message,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Agent run failed: {exc}") from exc

    if answer is None:
        raise HTTPException(status_code=404, detail="Session not found")

    history = agent_service.get_history(payload.session_id) or []
    return ChatResponseVO(
        session_id=payload.session_id,
        answer=answer,
        history_count=len(history),
    )


@router.post("/completions/stream")
async def create_chat_completion_stream(
    payload: ChatRequestDTO,
    agent_service: AgentService = Depends(get_agent_service),
    session_service: SessionService = Depends(get_session_service),
) -> StreamingResponse:
    """执行一次流式问答，并在会话不存在时提前返回 404。"""

    session = session_service.get_session(payload.session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")

    return _streaming_response(agent_service, payload.session_id, payload.message)