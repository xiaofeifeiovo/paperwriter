"""AI相关数据模型"""
from pydantic import BaseModel, Field
from typing import Literal, Optional


class Diagnostic(BaseModel):
    """诊断信息"""
    from: dict = Field(..., description="错误起始位置 {line, ch}")
    to: dict = Field(..., description="错误结束位置 {line, ch}")
    severity: Literal["info", "warning", "error"] = Field(..., description="严重程度")
    message: str = Field(..., description="错误消息")


class AIRequest(BaseModel):
    """AI请求基类"""
    project_id: str = Field(..., description="项目ID")
    context: dict = Field(default_factory=dict, description="上下文信息")


class AIResponse(BaseModel):
    """AI响应基类"""
    success: bool = Field(..., description="是否成功")
    data: dict = Field(default_factory=dict, description="响应数据")
    diagnostics: list[Diagnostic] = Field(default_factory=list, description="诊断信息")
    message: Optional[str] = Field(None, description="响应消息")


class ChatMessage(BaseModel):
    """聊天消息"""
    role: Literal["user", "assistant", "system"] = Field(..., description="角色")
    content: str = Field(..., description="消息内容")
