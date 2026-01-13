"""PaperWriter Backend 启动脚本"""
import uvicorn
import sys
from pathlib import Path

# 添加项目根目录到 Python 路径
backend_root = Path(__file__).parent
sys.path.insert(0, str(backend_root))

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
