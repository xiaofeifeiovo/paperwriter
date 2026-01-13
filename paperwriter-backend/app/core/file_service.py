"""文件操作服务"""
import aiofiles
from pathlib import Path
from typing import Optional
from app.config import settings
from app.models.file import FileNode


class FileService:
    """文件操作服务"""

    def __init__(self):
        self.projects_root = settings.PROJECTS_ROOT

    def _get_project_path(self, project_id: str) -> Path:
        """获取项目路径"""
        project_path = self.projects_root / project_id
        if not project_path.exists():
            raise FileNotFoundError(f"项目不存在: {project_id}")
        return project_path

    def _resolve_file_path(self, project_id: str, file_path: str) -> Path:
        """
        解析文件路径（安全检查）

        Args:
            project_id: 项目ID
            file_path: 文件相对路径

        Returns:
            Path: 文件绝对路径
        """
        project_path = self._get_project_path(project_id)

        # 规范化路径，防止路径遍历攻击
        normalized = Path(file_path).resolve()
        try:
            # 确保文件在项目目录内
            full_path = (project_path / normalized).resolve()
            full_path.relative_to(project_path.resolve())
        except ValueError:
            raise ValueError(f"非法路径: {file_path}")

        return full_path

    async def read_file(self, project_id: str, file_path: str) -> str:
        """
        读取文件内容

        Args:
            project_id: 项目ID
            file_path: 文件相对路径

        Returns:
            str: 文件内容
        """
        full_path = self._resolve_file_path(project_id, file_path)

        if not full_path.exists():
            raise FileNotFoundError(f"文件不存在: {file_path}")

        if not full_path.is_file():
            raise ValueError(f"不是文件: {file_path}")

        async with aiofiles.open(full_path, "r", encoding="utf-8") as f:
            content = await f.read()

        return content

    async def write_file(
        self,
        project_id: str,
        file_path: str,
        content: str,
        encoding: str = "utf-8"
    ) -> None:
        """
        写入文件内容

        Args:
            project_id: 项目ID
            file_path: 文件相对路径
            content: 文件内容
            encoding: 文件编码
        """
        full_path = self._resolve_file_path(project_id, file_path)

        # 确保父目录存在
        full_path.parent.mkdir(parents=True, exist_ok=True)

        async with aiofiles.open(full_path, "w", encoding=encoding) as f:
            await f.write(content)

    async def create_file(
        self,
        project_id: str,
        file_path: str,
        content: str = "",
        file_type: str = "file"
    ) -> None:
        """
        创建新文件或文件夹

        Args:
            project_id: 项目ID
            file_path: 文件相对路径
            content: 初始内容（仅文件）
            file_type: 类型 ('file' | 'folder')
        """
        full_path = self._resolve_file_path(project_id, file_path)

        if full_path.exists():
            raise FileExistsError(f"文件已存在: {file_path}")

        if file_type == "folder":
            full_path.mkdir(parents=True, exist_ok=True)
        else:
            full_path.parent.mkdir(parents=True, exist_ok=True)
            async with aiofiles.open(full_path, "w", encoding="utf-8") as f:
                await f.write(content)

    async def delete_file(self, project_id: str, file_path: str) -> None:
        """
        删除文件或文件夹

        Args:
            project_id: 项目ID
            file_path: 文件相对路径
        """
        full_path = self._resolve_file_path(project_id, file_path)

        if not full_path.exists():
            raise FileNotFoundError(f"文件不存在: {file_path}")

        if full_path.is_file():
            full_path.unlink()
        elif full_path.is_dir():
            shutil.rmtree(full_path)

    async def list_files(
        self,
        project_id: str,
        folder_path: str = ""
    ) -> list[FileNode]:
        """
        列出目录中的文件

        Args:
            project_id: 项目ID
            folder_path: 文件夹相对路径

        Returns:
            list[FileNode]: 文件节点列表
        """
        project_path = self._get_project_path(project_id)
        full_path = project_path / folder_path if folder_path else project_path

        if not full_path.exists():
            raise FileNotFoundError(f"目录不存在: {folder_path}")

        if not full_path.is_dir():
            raise ValueError(f"不是目录: {folder_path}")

        files = []
        for item in sorted(full_path.iterdir()):
            # 跳过隐藏文件
            if item.name.startswith("."):
                continue

            rel_path = item.relative_to(project_path)
            files.append(FileNode(
                name=item.name,
                path=str(rel_path).replace("\\", "/"),
                type="folder" if item.is_dir() else "file",
                extension=item.suffix if item.is_file() else None
            ))

        return files


# 全局服务实例
file_service = FileService()
