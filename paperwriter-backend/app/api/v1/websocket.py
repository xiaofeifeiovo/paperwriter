"""WebSocket 实时检查端点"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from typing import Optional
import json
import asyncio
from app.core.ai_service import ai_service

router = APIRouter()


class WebSocketConnectionManager:
    """WebSocket 连接管理器"""

    def __init__(self):
        self.active_connections: dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, project_id: str):
        """接受连接"""
        await websocket.accept()
        self.active_connections[project_id] = websocket

    def disconnect(self, project_id: str):
        """断开连接"""
        if project_id in self.active_connections:
            del self.active_connections[project_id]

    async def send_message(self, project_id: str, message: dict):
        """发送消息"""
        if project_id in self.active_connections:
            await self.active_connections[project_id].send_json(message)


manager = WebSocketConnectionManager()


@router.websocket("/stream")
async def websocket_realtime_check(
    websocket: WebSocket,
    project_id: str = Query(..., description="项目ID")
):
    """
    WebSocket 实时检查端点

    客户端可以发送以下类型的消息：
    - {"type": "check_content", "content": "...", "check_type": "all"}
    - {"type": "analyze", "idea": "...", "context": "..."}

    服务端响应：
    - {"type": "diagnostics", "data": [...]}
    - {"type": "stream", "content": "..."}
    - {"type": "complete"}
    - {"type": "error", "message": "..."}
    """
    await manager.connect(websocket, project_id)

    try:
        while True:
            # 接收客户端消息
            data = await websocket.receive_json()
            message_type = data.get("type")

            if message_type == "check_content":
                # 内容检查
                content = data.get("content", "")
                check_type = data.get("check_type", "all")

                try:
                    diagnostics = await ai_service.check_content(content, check_type)
                    await manager.send_message(project_id, {
                        "type": "diagnostics",
                        "data": diagnostics
                    })
                except Exception as e:
                    await manager.send_message(project_id, {
                        "type": "error",
                        "message": str(e)
                    })

            elif message_type == "analyze":
                # 分析 idea（流式）
                idea = data.get("idea", "")
                context = data.get("context", "")

                try:
                    async for chunk in ai_service.analyze_idea(idea, context):
                        await manager.send_message(project_id, {
                            "type": "stream",
                            "content": chunk
                        })

                    await manager.send_message(project_id, {"type": "complete"})
                except Exception as e:
                    await manager.send_message(project_id, {
                        "type": "error",
                        "message": str(e)
                    })

            elif message_type == "continue":
                # 续写（流式）
                current_content = data.get("current_content", "")
                file_context = data.get("file_context", "")

                try:
                    async for chunk in ai_service.continue_writing(current_content, file_context):
                        await manager.send_message(project_id, {
                            "type": "stream",
                            "content": chunk
                        })

                    await manager.send_message(project_id, {"type": "complete"})
                except Exception as e:
                    await manager.send_message(project_id, {
                        "type": "error",
                        "message": str(e)
                    })

            else:
                await manager.send_message(project_id, {
                    "type": "error",
                    "message": f"Unknown message type: {message_type}"
                })

    except WebSocketDisconnect:
        manager.disconnect(project_id)
    except Exception as e:
        await manager.send_message(project_id, {
            "type": "error",
            "message": str(e)
        })
        manager.disconnect(project_id)
