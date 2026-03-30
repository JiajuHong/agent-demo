"""健康检查接口。"""

from fastapi import APIRouter

router = APIRouter()


@router.get("")
async def health_check() -> dict:
    """用于容器探针与联调时确认服务可用。"""
    return {"status": "ok"}
