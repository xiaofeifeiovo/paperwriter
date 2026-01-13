# PaperWriter

**AI 驱动的学术论文写作编辑器**

一个专门为学术论文写作设计的现代化编辑器，深度集成阿里云通义千问 AI 助手，提供上下文感知的智能写作辅助。

---

## ✨ 核心特性

### 🎯 强制项目管理
- 必须先创建/打开项目才能使用
- 固定的项目结构：`idea/`、`主体/`、`引用/`、`代码/`
- 完整的项目生命周期管理

### 🤖 上下文感知 AI
根据文件所在目录自动提供不同的 AI 功能：
- **idea/** - 分析研究想法的可行性
- **主体/** - 文本转 LaTeX、续写内容、内容检查
- **引用/** - 搜索相关文献
- **代码/** - 生成代码

### ⚡ 实时智能检查
- WebSocket 实时连接
- 语法和逻辑错误检查
- 流式 AI 响应

### 📝 专业编辑器
- 基于 CodeMirror 6 的高性能编辑器
- LaTeX 语法高亮
- 多标签页编辑
- 自动保存（2秒延迟）
- Ctrl+S 快速保存

### 🎨 现代化界面
- VSCode 风格的三栏布局
- 响应式设计
- 暗色主题支持
- 流畅的交互动画

---

## 🏗️ 技术架构

### 后端技术栈
- **FastAPI** - 高性能异步 Web 框架
- **Pydantic** - 数据验证和设置管理
- **aiofiles** - 异步文件操作
- **dashscope** - 阿里云通义千问 SDK
- **tenacity** - 重试机制
- **WebSocket** - 实时通信

### 前端技术栈
- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 极速构建工具
- **Zustand** - 轻量级状态管理
- **CodeMirror 6** - 专业代码编辑器
- **Tailwind CSS** - 原子化 CSS
- **Lucide React** - 图标库

---

## 📁 项目结构

```
paperwriter/
├── paperwriter-backend/          # 后端项目
│   ├── app/
│   │   ├── api/v1/              # API 路由
│   │   │   ├── health.py        # 健康检查
│   │   │   ├── project.py       # 项目管理 API
│   │   │   ├── files.py         # 文件操作 API
│   │   │   ├── ai.py            # AI 功能 API
│   │   │   └── websocket.py     # WebSocket 端点
│   │   ├── core/                # 核心服务
│   │   │   ├── project_service.py
│   │   │   ├── file_service.py
│   │   │   └── ai_service.py    # AI 服务核心
│   │   ├── models/              # Pydantic 数据模型
│   │   ├── utils/               # 工具函数
│   │   ├── config.py            # 配置管理
│   │   └── main.py              # 应用入口
│   ├── projects/                # 项目存储目录
│   ├── requirements.txt
│   └── run.py
│
└── paperwriter-frontend/         # 前端项目
    ├── src/
    │   ├── components/          # 组件库
    │   │   ├── layout/          # 布局组件
    │   │   ├── editor/          # 编辑器组件
    │   │   ├── ai/              # AI 组件
    │   │   └── files/           # 文件组件
    │   ├── pages/               # 页面
    │   ├── services/            # API 服务
    │   ├── store/               # 状态管理
    │   ├── hooks/               # 自定义 Hooks
    │   ├── types/               # 类型定义
    │   └── styles/              # 样式文件
    └── package.json
```

---

## 🚀 快速开始

### 环境要求
- Node.js 18+
- Python 3.10+
- 阿里云通义千问 API Key

### 后端设置

1. **进入后端目录**
   ```bash
   cd paperwriter-backend
   ```

2. **安装依赖**
   ```bash
   pip install -r requirements.txt
   ```

3. **配置环境变量**

   编辑 `.env` 文件：
   ```env
   DASHSCOPE_API_KEY=your_api_key_here
   DASHSCOPE_MODEL=qwen-turbo
   ```

4. **启动后端**
   ```bash
   python run.py
   ```

   后端将运行在 `http://localhost:8000`

   API 文档: `http://localhost:8000/docs`

### 前端设置

1. **进入前端目录**
   ```bash
   cd paperwriter-frontend
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   ```

   前端将运行在 `http://localhost:5173`

---

## 📖 使用指南

### 1. 创建项目
- 在项目选择页点击"创建新项目"
- 输入项目名称
- 系统会自动创建标准的目录结构

### 2. 编辑文件
- 在左侧文件浏览器中选择文件
- 在中间编辑器中编辑内容
- Ctrl+S 或等待自动保存

### 3. 使用 AI 功能
- 选择文件后，右侧会显示相应的 AI 功能按钮
- 根据文件所在目录，AI 会提供不同的功能
- 支持流式响应，实时查看 AI 输出

### 4. 管理文件
- 点击标题栏的 "+" 按钮创建新文件/文件夹
- hover 文件时显示删除按钮

---

## 🎯 API 端点

### 项目管理
- `POST /api/v1/project/create` - 创建项目
- `POST /api/v1/project/open` - 打开项目
- `GET /api/v1/project/validate` - 验证项目
- `GET /api/v1/project/structure` - 获取项目结构

### 文件操作
- `GET /api/v1/files/list` - 列出文件
- `POST /api/v1/files/read` - 读取文件
- `POST /api/v1/files/write` - 写入文件
- `POST /api/v1/files/create` - 创建文件
- `DELETE /api/v1/files/delete` - 删除文件

### AI 功能
- `POST /api/v1/ai/analyze-idea` - 分析想法（流式）
- `POST /api/v1/ai/text-to-latex` - 文本转 LaTeX
- `POST /api/v1/ai/continue-writing` - 续写内容（流式）
- `POST /api/v1/ai/check-content` - 检查内容
- `POST /api/v1/ai/search-papers` - 搜索文献
- `POST /api/v1/ai/generate-code` - 生成代码

### WebSocket
- `WS /api/v1/stream?project_id=xxx` - 实时检查

---

## 🔧 开发计划

### ✅ Phase 1: 基础框架（已完成）
- [x] 项目目录结构
- [x] 配置管理
- [x] 状态管理
- [x] 基础布局

### ✅ Phase 2: 核心编辑功能（已完成）
- [x] CodeMirror 6 编辑器
- [x] 文件浏览器
- [x] 自动保存
- [x] 多标签页

### ✅ Phase 3: AI 功能集成（已完成）
- [x] AI 服务核心
- [x] 上下文感知 AI
- [x] 流式响应
- [x] 所有 AI 功能实现

### ✅ Phase 4: 实时检查与优化（已完成）
- [x] WebSocket 实时检查
- [x] 文件创建/删除功能
- [x] 错误处理和重试

---

## 📝 许可证

MIT License

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📧 联系

如有问题，请提交 Issue 或联系项目维护者。

---

**PaperWriter** - 让学术写作更智能 🚀
