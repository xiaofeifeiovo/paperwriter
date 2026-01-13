# PaperWriter Backend

AI 驱动的学术论文写作编辑器后端服务。

## 技术栈

- FastAPI - 高性能 Web 框架
- Pydantic - 数据验证
- aiofiles - 异步文件操作
- dashscope - 阿里云通义千问 SDK

## 项目结构

```
app/
├── api/v1/          # API 路由
│   ├── health.py    # 健康检查
│   ├── project.py   # 项目管理
│   └── files.py     # 文件操作
├── core/            # 核心服务
│   ├── project_service.py
│   └── file_service.py
├── models/          # 数据模型
├── utils/           # 工具函数
├── config.py        # 配置管理
└── main.py          # 应用入口
```

## 环境变量

创建 `.env` 文件：

```env
DASHSCOPE_API_KEY=your_api_key_here
DASHSCOPE_MODEL=qwen-turbo
HOST=0.0.0.0
PORT=8000
```

## 运行

```bash
# 安装依赖
pip install -r requirements.txt

# 启动服务
python run.py
```

API 文档: http://localhost:8000/docs
