"""文件操作 API"""
from fastapi import APIRouter, HTTPException, Query
from app.models.file import FileRead, FileWrite, FileCreate, FileDelete
from app.core.file_service import file_service

router = APIRouter()


@router.get("/list")
async def list_files(
    project_id: str = Query(..., description="项目ID"),
    folder_path: str = Query("", description="文件夹路径")
):
    """
    列出目录中的文件

    - **project_id**: 项目ID
    - **folder_path**: 文件夹相对路径（空字符串表示项目根目录）
    """
    try:
        files = await file_service.list_files(project_id, folder_path)
        return {"files": files}
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"列出文件失败: {str(e)}")


@router.post("/read")
async def read_file(request: FileRead):
    """
    读取文件内容

    - **project_id**: 项目ID（从请求体获取）
    - **file_path**: 文件相对路径
    """
    try:
        content = await file_service.read_file(request.project_id, request.file_path)
        return {
            "success": True,
            "content": content
        }
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="文件不存在")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"读取文件失败: {str(e)}")


@router.post("/write")
async def write_file(request: FileWrite):
    """
    写入文件内容

    - **project_id**: 项目ID（从请求体获取）
    - **file_path**: 文件相对路径
    - **content**: 文件内容
    - **encoding**: 文件编码（默认utf-8）
    """
    try:
        await file_service.write_file(
            request.project_id,
            request.file_path,
            request.content,
            request.encoding
        )
        return {
            "success": True,
            "message": "文件保存成功"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"写入文件失败: {str(e)}")


@router.post("/create")
async def create_file(request: FileCreate):
    """
    创建新文件或文件夹

    - **project_id**: 项目ID（从请求体获取）
    - **file_path**: 文件相对路径
    - **content**: 初始内容（仅文件）
    - **file_type**: 类型 ('file' | 'folder')
    """
    try:
        await file_service.create_file(
            request.project_id,
            request.file_path,
            request.content,
            request.file_type
        )
        return {
            "success": True,
            "message": "创建成功"
        }
    except FileExistsError:
        raise HTTPException(status_code=409, detail="文件已存在")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"创建文件失败: {str(e)}")


@router.delete("/delete")
async def delete_file(request: FileDelete):
    """
    删除文件或文件夹

    - **project_id**: 项目ID（从请求体获取）
    - **file_path**: 文件相对路径
    """
    try:
        await file_service.delete_file(request.project_id, request.file_path)
        return {
            "success": True,
            "message": "删除成功"
        }
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="文件不存在")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"删除文件失败: {str(e)}")
