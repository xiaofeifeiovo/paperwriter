"""项目管理 API"""
from fastapi import APIRouter, HTTPException
from app.models.project import ProjectCreate, ProjectOpen, ProjectStructure
from app.core.project_service import project_service

router = APIRouter()


@router.post("/create", response_model=ProjectStructure)
async def create_project(request: ProjectCreate):
    """
    创建新项目

    - **name**: 项目名称（1-100字符）
    - **location**: 可选的项目存储位置
    """
    try:
        from pathlib import Path
        location = Path(request.location) if request.location else None
        structure = await project_service.create_project_structure(
            name=request.name,
            location=location
        )
        return structure
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"创建项目失败: {str(e)}")


@router.post("/open")
async def open_project(request: ProjectOpen):
    """
    打开现有项目

    - **project_id**: 项目ID
    """
    try:
        structure = await project_service.get_project_tree(request.project_id)
        validation = await project_service.validate_project(request.project_id)

        if not validation["valid"]:
            raise HTTPException(status_code=400, detail=validation.get("error"))

        return {
            "project_id": request.project_id,
            "structure": structure,
            "path": validation.get("path")
        }
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="项目不存在")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"打开项目失败: {str(e)}")


@router.get("/validate")
async def validate_project(project_id: str):
    """
    验证项目结构

    - **project_id**: 项目ID
    """
    try:
        result = await project_service.validate_project(project_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"验证项目失败: {str(e)}")


@router.get("/structure")
async def get_project_structure(project_id: str):
    """
    获取项目文件树结构

    - **project_id**: 项目ID
    """
    try:
        structure = await project_service.get_project_tree(project_id)
        return structure
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="项目不存在")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取项目结构失败: {str(e)}")


@router.post("/close")
async def close_project(project_id: str):
    """
    关闭项目（前端清理状态，后端仅确认）

    - **project_id**: 项目ID
    """
    return {
        "success": True,
        "message": "项目已关闭"
    }
