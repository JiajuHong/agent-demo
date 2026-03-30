# Backend (FastAPI)

这是前后端分离应用的后端工程骨架。

## 快速启动

1. 创建并激活虚拟环境（可选）
2. 安装依赖：

```bash
pip install -r requirements.txt
```

1. 启动服务：

```bash
uvicorn app.main:app --reload --host localhost --port 8000
```

1. 打开内置测试页面：

```text
http://127.0.0.1:8000/playground
```

## 环境变量

SimpleAgent 调用模型需要以下环境变量：

- `LLM_MODEL_ID`
- `LLM_API_KEY`
- `LLM_BASE_URL`

服务启动时会自动读取 `backend/.env`，无需额外传 `--env-file`。
如果系统环境变量已存在，同名项不会被 `.env` 覆盖。

## 当前接口

- `GET /` 服务状态
- `GET /api/v1/health` 健康检查
- `POST /api/v1/sessions` 创建会话
- `POST /api/v1/sessions/init` 初始化会话（创建会话并返回首屏配置）
- `GET /api/v1/sessions` 会话列表
- `GET /api/v1/sessions/{session_id}` 会话详情
- `GET /api/v1/sessions/{session_id}/history` 查看历史
- `POST /api/v1/sessions/{session_id}/reset` 清空历史
- `DELETE /api/v1/sessions/{session_id}` 删除会话
- `POST /api/v1/chat/completions` 基于会话进行对话
- `POST /api/v1/chat/completions/stream` SSE 流式对话

## 会话持久化

- 会话以 JSON 文件方式持久化到 `backend/data/sessions`
- 服务重启后可通过 `session_id` 继续对话

## 快速测试

1. 创建会话

```bash
curl -X POST "http://127.0.0.1:8000/api/v1/sessions" \
	-H "Content-Type: application/json" \
	-d '{"user_id":"u1"}'
```

1. 发起对话

```bash
curl -X POST "http://127.0.0.1:8000/api/v1/chat/completions" \
	-H "Content-Type: application/json" \
	-d '{"session_id":"<上一步返回的session_id>","message":"你好"}'
```

1. 流式对话（SSE）

```bash
curl -N -X POST "http://127.0.0.1:8000/api/v1/chat/completions/stream" \
	-H "Content-Type: application/json" \
	-d '{"session_id":"<session_id>","message":"请逐步回答这个问题"}'
```

