"""健康检查 API"""
from fastapi import APIRouter
from app.models.project import ProjectStructure

router = APIRouter()


@router.get("/health")
async def health_check():
    """健康检查接口"""
    return {
        "status": "healthy",
        "service": "PaperWriter API",
        "version": "1.0.0"
    }
