"""文件管理 API"""

import os
from fastapi import APIRouter, HTTPException, Body
from fastapi.responses import FileResponse, PlainTextResponse
from pydantic import BaseModel

router = APIRouter()

class FileTreeResponse(BaseModel):
    path: str
    type: str  # "file" or "directory"

class FileContentRequest(BaseModel):
    content: str

def get_project_root(session_id: str) -> str:
    """获取 session 对应的项目根目录"""
    return os.path.join(os.getcwd(), "generated", session_id)

@router.get("/{session_id}/tree")
async def get_file_tree(session_id: str):
    """获取代码目录树（递归所有文件）"""
    project_root = get_project_root(session_id)

    if not os.path.exists(project_root):
        return []

    def scan_dir(path: str) -> list:
        """递归扫描目录，返回所有文件"""
        items = []
        try:
            for name in os.listdir(path):
                item_path = os.path.join(path, name)
                if os.path.isfile(item_path):
                    rel_path = os.path.relpath(item_path, project_root)
                    items.append({"path": rel_path, "type": "file"})
                elif os.path.isdir(item_path) and not name.startswith('.'):
                    # 递归扫描子目录
                    items.extend(scan_dir(item_path))
        except PermissionError:
            pass
        return items

    return scan_dir(project_root)

@router.get("/{session_id}/{path:path}")
async def get_file(session_id: str, path: str):
    """获取文件内容"""
    if path.endswith("/"):
        raise HTTPException(status_code=400, detail="Path cannot be a directory")

    project_root = get_project_root(session_id)
    file_path = os.path.join(project_root, path)

    # 安全检查：确保文件在项目目录内
    if not os.path.normpath(file_path).startswith(os.path.normpath(project_root)):
        raise HTTPException(status_code=403, detail="Access denied")

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    if not os.path.isfile(file_path):
        raise HTTPException(status_code=400, detail="Not a file")

    # 统一返回纯文本
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    return PlainTextResponse(content)


@router.put("/{session_id}/{path:path}")
async def update_file(session_id: str, path: str, request: FileContentRequest):
    """更新文件内容"""
    if path.endswith("/"):
        raise HTTPException(status_code=400, detail="Path cannot be a directory")

    project_root = get_project_root(session_id)
    file_path = os.path.join(project_root, path)

    # 安全检查：确保文件在项目目录内
    if not os.path.normpath(file_path).startswith(os.path.normpath(project_root)):
        raise HTTPException(status_code=403, detail="Access denied")

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    if not os.path.isfile(file_path):
        raise HTTPException(status_code=400, detail="Not a file")

    # 写入文件内容
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(request.content)
        return {"message": "File updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to write file: {str(e)}")
