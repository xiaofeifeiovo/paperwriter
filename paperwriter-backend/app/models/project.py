"""项目相关数据模型"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ProjectCreate(BaseModel):
    """创建项目请求"""
    name: str = Field(..., min_length=1, max_length=100, description="项目名称")
    location: Optional[str] = Field(None, description="项目存储位置（可选，默认使用配置的位置）")


class ProjectOpen(BaseModel):
    """打开项目请求"""
    project_id: str = Field(..., description="项目ID")


class FolderNode(BaseModel):
    """文件夹/文件节点"""
    name: str = Field(..., description="名称")
    path: str = Field(..., description="相对路径")
    type: str = Field(..., description="类型: 'folder' | 'file'")
    extension: Optional[str] = Field(None, description="文件扩展名")
    children: list["FolderNode"] = Field(default_factory=list, description="子节点")


class ProjectStructure(BaseModel):
    """项目结构"""
    project_id: str = Field(..., description="项目ID")
    name: str = Field(..., description="项目名称")
    root_path: str = Field(..., description="项目根路径")
    structure: FolderNode = Field(..., description="文件树结构")
    created_at: datetime = Field(default_factory=datetime.now, description="创建时间")


# 更新前向引用
FolderNode.model_rebuild()
