"""配置管理模块 - 复用 PaperReader2 经验"""
from pydantic_settings import BaseSettings
from functools import lru_cache
from pathlib import Path


class Settings(BaseSettings):
    """应用配置"""

    # DASHSCOPE API
    DASHSCOPE_API_KEY: str = ""
    DASHSCOPE_MODEL: str = "qwen-turbo"

    # Server Configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    RELOAD: bool = True

    # Project Configuration
    PROJECTS_ROOT: Path = Path("./projects")
    MAX_PROJECT_SIZE_MB: int = 1000

    # AI Configuration
    AI_TIMEOUT_SECONDS: int = 30
    AI_MAX_RETRIES: int = 3

    # File Upload Configuration
    MAX_FILE_SIZE_MB: int = 100
    ALLOWED_EXTENSIONS: list[str] = [
        ".pdf", ".txt", ".md", ".tex",
        ".py", ".js", ".ts", ".json"
    ]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # 确保 PROJECTS_ROOT 是绝对路径
        if not self.PROJECTS_ROOT.is_absolute():
            self.PROJECTS_ROOT = Path(__file__).parent.parent / self.PROJECTS_ROOT
        # 确保 projects 目录存在
        self.PROJECTS_ROOT.mkdir(parents=True, exist_ok=True)


@lru_cache()
def get_settings() -> Settings:
    """获取配置单例"""
    return Settings()


# 全局配置实例
settings = get_settings()
