"""FastAPI 应用入口，负责基础中间件与顶层路由装配。"""

from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from dotenv import load_dotenv

# 自动加载 backend/.env，且不覆盖已存在的系统环境变量。
load_dotenv(dotenv_path=Path(__file__).resolve().parents[1] / ".env", override=False)

from app.api.v1.router import api_v1_router

STATIC_DIR = Path(__file__).resolve().parent / "static"

app = FastAPI(
    title="HelloAgents Web Backend",
    version="0.1.0",
    description="Frontend-backend separated backend scaffold.",
)

# 先允许全部来源，便于前端联调；上线前应收敛为白名单域名。
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["system"])
async def root() -> dict:
    """返回服务存活信息与常用入口。"""
    return {
        "message": "Backend is running",
        "docs": "/docs",
        "playground": "/playground",
    }


@app.get("/playground", tags=["system"])
async def playground() -> FileResponse:
    """返回本地调试用的静态聊天页面。"""
    return FileResponse(STATIC_DIR / "chat_playground.html")


app.include_router(api_v1_router, prefix="/api/v1")
