"""文件相关数据模型"""
from pydantic import BaseModel, Field


class FileRead(BaseModel):
    """读取文件请求"""
    file_path: str = Field(..., description="文件相对路径")


class FileWrite(BaseModel):
    """写入文件请求"""
    file_path: str = Field(..., description="文件相对路径")
    content: str = Field(..., description="文件内容")
    encoding: str = Field(default="utf-8", description="文件编码")


class FileCreate(BaseModel):
    """创建文件请求"""
    file_path: str = Field(..., description="文件相对路径")
    content: str = Field(default="", description="初始内容")
    file_type: str = Field(default="file", description="类型: 'file' | 'folder'")


class FileDelete(BaseModel):
    """删除文件请求"""
    file_path: str = Field(..., description="文件相对路径")


class FileNode(BaseModel):
    """文件节点"""
    name: str
    path: str
    type: str  # 'file' or 'folder'
    extension: str | None = None
