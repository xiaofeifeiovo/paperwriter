"""AI 功能 API"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from typing import List
from pydantic import BaseModel, Field
from app.core.ai_service import ai_service

router = APIRouter()


class AnalyzeIdeaRequest(BaseModel):
    """分析 idea 请求"""
    project_id: str
    idea_content: str
    project_context: str = ""


class TextToLatexRequest(BaseModel):
    """文本转 LaTeX 请求"""
    project_id: str
    text: str


class ContinueWritingRequest(BaseModel):
    """续写请求"""
    project_id: str
    current_content: str
    file_context: str = ""


class CheckContentRequest(BaseModel):
    """检查内容请求"""
    project_id: str
    content: str
    check_type: str = "all"


class SearchPapersRequest(BaseModel):
    """搜索文献请求"""
    project_id: str
    keywords: List[str]
    field: str = ""


class GenerateCodeRequest(BaseModel):
    """生成代码请求"""
    project_id: str
    description: str
    language: str = "python"


@router.post("/analyze-idea")
async def analyze_idea(request: AnalyzeIdeaRequest):
    """
    分析 idea 可行性（流式响应）

    - **project_id**: 项目ID
    - **idea_content**: 创新点内容
    - **project_context**: 项目上下文（可选）
    """
    async def generate():
        try:
            async for chunk in ai_service.analyze_idea(
                request.idea_content,
                request.project_context
            ):
                yield f"data: {chunk}\n\n"
        except Exception as e:
            yield f"data: [ERROR] {str(e)}\n\n"
        finally:
            yield "data: [DONE]\n\n"

    return StreamingResponse(generate(), media_type="text/plain")


@router.post("/text-to-latex")
async def text_to_latex(request: TextToLatexRequest):
    """
    将纯文本转换为 LaTeX 格式

    - **project_id**: 项目ID
    - **text**: 待转换的文本
    """
    try:
        result = await ai_service.text_to_latex(request.text)
        return {
            "success": True,
            "result": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"转换失败: {str(e)}")


@router.post("/continue-writing")
async def continue_writing(request: ContinueWritingRequest):
    """
    续写论文内容（流式响应）

    - **project_id**: 项目ID
    - **current_content**: 当前内容
    - **file_context**: 文件上下文（可选）
    """
    async def generate():
        try:
            async for chunk in ai_service.continue_writing(
                request.current_content,
                request.file_context
            ):
                yield f"data: {chunk}\n\n"
        except Exception as e:
            yield f"data: [ERROR] {str(e)}\n\n"
        finally:
            yield "data: [DONE]\n\n"

    return StreamingResponse(generate(), media_type="text/plain")


@router.post("/check-content")
async def check_content(request: CheckContentRequest):
    """
    检查内容问题

    - **project_id**: 项目ID
    - **content**: 待检查内容
    - **check_type**: 检查类型 (grammar, logic, all)
    """
    try:
        diagnostics = await ai_service.check_content(
            request.content,
            request.check_type
        )
        return {
            "success": True,
            "diagnostics": diagnostics
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"检查失败: {str(e)}")


@router.post("/search-papers")
async def search_papers(request: SearchPapersRequest):
    """
    搜索相关文献

    - **project_id**: 项目ID
    - **keywords**: 关键词列表
    - **field**: 研究领域（可选）
    """
    try:
        result = await ai_service.search_papers(
            request.keywords,
            request.field
        )
        return {
            "success": True,
            "result": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"搜索失败: {str(e)}")


@router.post("/generate-code")
async def generate_code(request: GenerateCodeRequest):
    """
    生成代码

    - **project_id**: 项目ID
    - **description**: 代码描述
    - **language**: 编程语言（默认 python）
    """
    try:
        result = await ai_service.generate_code(
            request.description,
            request.language
        )
        return {
            "success": True,
            "result": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"生成代码失败: {str(e)}")
