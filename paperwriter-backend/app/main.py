"""FastAPI 应用入口"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import settings
from app.api.v1 import project, files, health, ai, websocket


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动时执行
    print(f"🚀 PaperWriter Backend 启动中...")
    print(f"📁 项目存储目录: {settings.PROJECTS_ROOT.absolute()}")
    print(f"🤖 AI 模型: {settings.DASHSCOPE_MODEL}")

    yield

    # 关闭时执行
    print("👋 PaperWriter Backend 关闭中...")


# 创建 FastAPI 应用
app = FastAPI(
    title="PaperWriter API",
    description="AI驱动的学术论文写作编辑器后端",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Vite 默认端口
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 注册路由
app.include_router(
    health.router,
    prefix="/api/v1",
    tags=["health"]
)

app.include_router(
    project.router,
    prefix="/api/v1/project",
    tags=["project"]
)

app.include_router(
    files.router,
    prefix="/api/v1/files",
    tags=["files"]
)

app.include_router(
    ai.router,
    prefix="/api/v1/ai",
    tags=["ai"]
)

app.include_router(
    websocket.router,
    prefix="/api/v1",
    tags=["websocket"]
)


# 根路径
@app.get("/")
async def root():
    return {
        "message": "PaperWriter API",
        "version": "1.0.0",
        "docs": "/docs"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.RELOAD
    )
