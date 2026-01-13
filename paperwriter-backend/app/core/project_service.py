"""项目管理服务 - 创建和管理项目结构"""
import aiofiles
import shutil
from pathlib import Path
from datetime import datetime
from typing import Optional
from app.config import settings
from app.models.project import FolderNode, ProjectStructure


class ProjectService:
    """项目管理服务"""

    def __init__(self):
        self.projects_root = settings.PROJECTS_ROOT

    async def create_project_structure(
        self,
        name: str,
        location: Optional[Path] = None
    ) -> ProjectStructure:
        """
        创建项目结构

        Args:
            name: 项目名称
            location: 项目存储位置（可选）

        Returns:
            ProjectStructure: 项目结构
        """
        # 生成项目ID（使用时间戳 + 项目名）
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        safe_name = "".join(c for c in name if c.isalnum() or c in (" ", "-", "_"))
        project_id = f"project-{timestamp}-{safe_name.replace(' ', '-')}"

        # 确定项目根目录
        if location is None:
            project_path = self.projects_root / project_id
        else:
            project_path = location / project_id

        # 创建项目目录结构
        project_path.mkdir(parents=True, exist_ok=True)

        # 创建标准目录
        folders = ["idea", "主体", "引用", "代码"]
        for folder in folders:
            (project_path / folder).mkdir(exist_ok=True)

        # 创建初始化文件
        initial_files = {
            "idea/main_idea.md": "# 主要创新点\n\n在这里描述你的论文核心创新点...",
            "主体/main_content.txt": "在此处撰写论文主体内容...",
            "主体/images/.gitkeep": "",
            "引用/.gitkeep": "",
            "代码/.gitkeep": ""
        }

        for file_path, content in initial_files.items():
            full_path = project_path / file_path
            full_path.parent.mkdir(parents=True, exist_ok=True)
            async with aiofiles.open(full_path, "w", encoding="utf-8") as f:
                await f.write(content)

        # 生成项目结构
        structure = await self.get_project_tree(project_id, project_path)

        return ProjectStructure(
            project_id=project_id,
            name=name,
            root_path=str(project_path),
            structure=structure,
            created_at=datetime.now()
        )

    async def get_project_tree(
        self,
        project_id: str,
        project_path: Optional[Path] = None
    ) -> FolderNode:
        """
        获取项目文件树

        Args:
            project_id: 项目ID
            project_path: 项目路径（可选，默认根据ID查找）

        Returns:
            FolderNode: 文件树根节点
        """
        if project_path is None:
            project_path = self.projects_root / project_id

        if not project_path.exists():
            raise FileNotFoundError(f"项目不存在: {project_id}")

        return await self._build_tree(project_path, project_path)

    async def _build_tree(
        self,
        root_path: Path,
        current_path: Path,
        relative_path: str = ""
    ) -> FolderNode:
        """
        递归构建文件树

        Args:
            root_path: 项目根路径
            current_path: 当前路径
            relative_path: 相对路径

        Returns:
            FolderNode: 文件树节点
        """
        name = current_path.name
        rel_path = f"{relative_path}/{name}" if relative_path else name

        if current_path.is_file():
            return FolderNode(
                name=name,
                path=rel_path.replace("\\", "/"),
                type="file",
                extension=current_path.suffix,
                children=[]
            )

        # 文件夹：递归处理子项
        children = []
        try:
            for item in sorted(current_path.iterdir()):
                # 跳过隐藏文件
                if item.name.startswith("."):
                    continue
                child = await self._build_tree(root_path, item, rel_path)
                children.append(child)
        except PermissionError:
            pass

        return FolderNode(
            name=name,
            path=rel_path.replace("\\", "/"),
            type="folder",
            extension=None,
            children=children
        )

    async def validate_project(self, project_id: str) -> dict:
        """
        验证项目结构

        Args:
            project_id: 项目ID

        Returns:
            dict: 验证结果
        """
        project_path = self.projects_root / project_id

        if not project_path.exists():
            return {
                "valid": False,
                "error": "项目不存在"
            }

        # 检查必需的目录
        required_folders = ["idea", "主体", "引用", "代码"]
        missing = []

        for folder in required_folders:
            if not (project_path / folder).exists():
                missing.append(folder)

        if missing:
            return {
                "valid": False,
                "error": f"缺少目录: {', '.join(missing)}"
            }

        return {
            "valid": True,
            "project_id": project_id,
            "path": str(project_path)
        }


# 全局服务实例
project_service = ProjectService()
