"""API v1 总路由，统一挂载各业务 controller。"""

from fastapi import APIRouter

from app.api.v1.endpoints import chat, health, session, file

api_v1_router = APIRouter()
api_v1_router.include_router(health.router, prefix="/health", tags=["health"])
api_v1_router.include_router(session.router, prefix="/sessions", tags=["sessions"])
api_v1_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_v1_router.include_router(file.router, prefix="/files", tags=["files"])
