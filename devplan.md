# PaperWriter - AI驱动的学术论文写作编辑器

**版本**: v1.0
**创建时间**: 2026-01-13
**预计完成**: 2026-03-27 (10周)
**项目类型**: 全新的Web应用 (从零开始)

---

## 📋 项目概述

### 项目定位
PaperWriter是一个**专门为学术论文写作设计的编辑器**,界面参考VSCode的三栏布局,深度集成阿里云通义千问AI助手,提供上下文感知的智能写作辅助。

### 与PaperReader2的对比

| 维度 | PaperReader2 (阅读器) | PaperWriter (写作器) |
|------|---------------------|---------------------|
| **核心功能** | PDF阅读 + AI问答 | 论文写作 + AI辅助 |
| **主要操作** | 上传文档 → 转换 → 阅读 | 创建项目 → 写作 → 转换 |
| **AI触发** | 用户提问触发AI | **上下文自动触发AI** |
| **文件管理** | 临时文档管理 | **强制项目管理** |
| **编辑器** | Markdown查看器 | **CodeMirror代码编辑器** |
| **实时反馈** | 无 | **语法/逻辑检查** |
| **文件结构** | uploads/processed | **固定的项目结构** |

### 核心创新点

1. **强制项目管理**: 必须先打开/创建项目才能使用
2. **上下文感知AI**: 根据文件位置自动提供不同的AI功能
3. **实时智能检查**: 编辑时自动发现语法和逻辑错误
4. **多格式支持**: 纯文本 ↔ LaTeX双向转换
5. **全流程辅助**: 从idea到正文到代码的完整写作链路

---

## 🏗️ 技术架构设计

### 整体架构图

```
┌──────────────────────────────────────────────────────────────────┐
│                        前端层 (React + Vite)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ 文件浏览器   │  │CodeMirror    │  │    AI助手面板         │   │
│  │ (ProjectTree)│  │编辑器        │  │ (上下文感知按钮组)    │   │
│  │              │  │              │  │                      │   │
│  │ - idea/      │  │ - LaTeX高亮  │  │ [根据位置变化]        │   │
│  │ - 主体/      │  │ - 多标签页   │  │ - idea: 分析可行性    │   │
│  │ - 引用/      │  │ - 错误高亮   │  │ - 主体: 转换+续写     │   │
│  │ - 代码/      │  │ - 自动保存   │  │ - 引用: 搜索文献      │   │
│  └──────────────┘  └──────────────┘  │ - 代码: 生成代码      │   │
│                                        └──────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
                              ↓ HTTP/SSE/WebSocket
┌──────────────────────────────────────────────────────────────────┐
│                    API网关层 (FastAPI)                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ 项目管理API  │  │ 文件操作API  │  │   AI功能API          │   │
│  │ - create     │  │ - read       │  │ - analyze-idea       │   │
│  │ - open       │  │ - write      │  │ - text-to-latex      │   │
│  │ - validate   │  │ - create     │  │ - continue-writing   │   │
│  │ - structure  │  │ - delete     │  │ - check-content      │   │
│  └──────────────┘  └──────────────┘  │ - search-papers      │   │
│                                        │ - generate-code      │   │
│                                        │ WebSocket: 实时检查  │   │
│                                        └──────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│                    业务逻辑层 (Services)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ProjectService│  │ FileService  │  │   AIService          │   │
│  │              │  │              │  │                      │   │
│  │ - 创建结构   │  │ - 文件读写   │  │ - 通义千问集成       │   │
│  │ - 验证结构   │  │ - 路径处理   │  │ - 流式响应           │   │
│  │ - 结构管理   │  │ - 监听变化   │  │ - 错误重试           │   │
│  └──────────────┘  └──────────────┘  │ - 速率限制           │   │
│                                        └──────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│                    数据存储层 (本地文件系统)                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    projects/                             │   │
│  │  ├── project-{id1}/                                     │   │
│  │  │   ├── idea/                                          │   │
│  │  │  │   └── main_idea.md                                │   │
│  │  │   ├── 主体/                                          │   │
│  │  │  │   ├── main_content.txt                            │   │
│  │  │  │   ├── main_content.tex                            │   │
│  │  │  │   └── images/                                     │   │
│  │  │   ├── 引用/                                          │   │
│  │  │  │   ├── paper1.pdf                                  │   │
│  │  │  │   ├── paper2.pdf                                  │   │
│  │  │  │   └── toc.json                                    │   │
│  │  │   └── 代码/                                          │   │
│  │  │      └── generated_code.py                           │   │
│  │  └── project-{id2}/                                     │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### 技术栈详细选型

#### 后端技术栈
| 组件 | 技术选型 | 版本 | 选型理由 |
|------|---------|------|---------|
| **Web框架** | FastAPI | ^0.109.0 | 高性能、自动文档、原生异步、复用paperreader2经验 |
| **ASGI服务器** | uvicorn | ^0.27.0 | FastAPI官方推荐、支持WebSocket |
| **AI服务** | dashscope | ^1.14.0 | 阿里云通义千问官方SDK、已验证可用 |
| **数据验证** | Pydantic | ^2.5.3 | FastAPI原生集成、类型安全 |
| **文件操作** | aiofiles | ^23.2.1 | 异步文件操作、性能优秀 |
| **配置管理** | pydantic-settings | ^2.1.0 | 类型安全的配置管理、复用paperreader2 |
| **异步任务** | asyncio | 内置 | Python原生异步、无额外依赖 |
| **重试机制** | tenacity | ^8.2.3 | AI调用失败自动重试 |

#### 前端技术栈
| 组件 | 技术选型 | 版本 | 选型理由 |
|------|---------|------|---------|
| **框架** | React | ^18.2.0 | 成熟生态、paperreader2已验证 |
| **构建工具** | Vite | ^5.0.12 | 极速热更新、现代化开发体验 |
| **语言** | TypeScript | ^5.3.3 | 类型安全、减少运行时错误 |
| **状态管理** | Zustand | ^4.5.0 | 轻量级、API简洁、paperreader2已用 |
| **编辑器核心** | CodeMirror 6 | ^6.0.0 | 模块化、高性能、扩展性强 |
| **LaTeX支持** | @codemirror/lang-latex | ^6.0.0 | 官方LaTeX语言支持 |
| **语法检查** | @codemirror/lint | ^6.0.0 | 官方linter扩展、支持自定义诊断 |
| **主题** | @codemirror/theme-one-dark | ^6.0.0 | 暗色主题、开发者友好 |
| **路由** | react-router-dom | ^6.21.0 | 单页应用路由管理 |
| **UI组件** | Radix UI | ^1.0.0 | 无样式组件、完全可定制 |
| **样式** | Tailwind CSS | ^3.4.1 | 原子化CSS、开发效率高 |
| **图标** | Lucide React | ^0.300.0 | 轻量级图标库、paperreader2已用 |
| **HTTP客户端** | axios | ^1.6.5 | API友好、拦截器强大 |
| **SSE解析** | eventsource | ^2.0.0 | 服务端推送事件解析 |
| **WebSocket** | 原生WebSocket API | - | 实时通信、无需额外依赖 |

---

## 📁 详细项目结构

### 后端目录结构
```
paperwriter-backend/
├── app/
│   ├── __init__.py
│   ├── main.py                        # FastAPI应用入口
│   ├── config.py                      # 配置管理(复用paperreader2)
│   │
│   ├── api/                           # API路由层
│   │   ├── __init__.py
│   │   ├── v1/
│   │   │   ├── __init__.py
│   │   │   ├── project.py             # 项目管理API
│   │   │   │   - POST   /create       # 创建新项目
│   │   │   │   - POST   /open         # 打开现有项目
│   │   │   │   - GET    /validate     # 验证项目结构
│   │   │   │   - GET    /structure    # 获取项目结构
│   │   │   │   - POST   /close        # 关闭项目
│   │   │   │
│   │   │   ├── files.py               # 文件操作API
│   │   │   │   - GET    /list         # 列出项目文件
│   │   │   │   - GET    /read         # 读取文件内容
│   │   │   │   - POST   /write        # 写入文件
│   │   │   │   - POST   /create       # 创建新文件
│   │   │   │   - DELETE /delete       # 删除文件
│   │   │   │
│   │   │   ├── ai.py                  # AI功能API
│   │   │   │   - POST   /analyze-idea          # 分析idea可行性
│   │   │   │   - POST   /text-to-latex         # 文本转LaTeX
│   │   │   │   - POST   /continue-writing      # 续写论文
│   │   │   │   - POST   /check-content         # 检查内容
│   │   │   │   - POST   /search-papers         # 搜索文献
│   │   │   │   - POST   /generate-code         # 生成代码
│   │   │   │   - WS     /stream                # WebSocket实时检查
│   │   │   │
│   │   │   └── health.py              # 健康检查API
│   │   │       - GET    /health       # 健康状态
│   │   │
│   ├── core/                          # 核心业务逻辑
│   │   ├── __init__.py
│   │   ├── project_service.py         # 项目管理服务
│   │   │   - create_project_structure()
│   │   │   - validate_project()
│   │   │   - get_project_tree()
│   │   │
│   │   ├── file_service.py            # 文件操作服务
│   │   │   - read_file()
│   │   │   - write_file()
│   │   │   - watch_file_changes()
│   │   │
│   │   └── ai_service.py              # AI服务核心(参考paperreader2)
│   │       - analyze_idea()
│   │       - text_to_latex()
│   │       - continue_writing()
│   │       - check_content()
│   │       - search_papers()
│   │       - generate_code()
│   │       - _call_with_retry()
│   │
│   ├── models/                        # Pydantic数据模型
│   │   ├── __init__.py
│   │   ├── project.py                 # 项目相关模型
│   │   │   - ProjectCreate
│   │   │   - ProjectOpen
│   │   │   - ProjectStructure
│   │   │   - FolderTree
│   │   │
│   │   ├── file.py                    # 文件相关模型
│   │   │   - FileRead
│   │   │   - FileWrite
│   │   │   - FileNode
│   │   │
│   │   └── ai.py                      # AI相关模型
│   │       - AIRequest
│   │       - AIResponse
│   │       - Diagnostic
│   │       - ChatMessage
│   │
│   └── utils/                         # 工具函数
│       ├── __init__.py
│       ├── file_utils.py              # 文件工具
│       │   - get_file_extension()
│       │   - sanitize_filename()
│       │   - normalize_path()         # Windows路径处理
│       │
│       └── ai_utils.py                # AI工具
│           - build_prompt()
│           - parse_ai_response()
│           - extract_diagnostics()
│
├── projects/                          # 项目存储目录(运行时创建)
│   └── project-{id}/
│
├── tests/                             # 测试代码
│   ├── __init__.py
│   ├── test_project_service.py
│   ├── test_ai_service.py
│   └── conftest.py
│
├── requirements.txt                   # Python依赖
├── .env.example                       # 环境变量示例
├── pyproject.toml                     # 项目配置
├── README.md                          # 后端说明文档
└── run.py                             # 启动脚本
```

### 前端目录结构
```
paperwriter-frontend/
├── src/
│   ├── main.tsx                       # React入口
│   ├── App.tsx                        # 根组件
│   ├── vite-env.d.ts                  # Vite类型声明
│   │
│   ├── router/                        # 路由配置
│   │   ├── index.tsx                  # 路由定义
│   │   └── guards/                    # 路由守卫
│   │       └── ProjectGuard.tsx      # 项目打开守卫(关键!)
│   │
│   ├── store/                         # Zustand状态管理
│   │   ├── appStore.ts                # 主状态(最重要!)
│   │   │   - project: {
│   │   │       isOpen: boolean
│   │   │       path: string | null
│   │   │       name: string | null
│   │   │       structure: FolderTree | null
│   │   │     }
│   │   │   - editor: {
│   │   │       currentFile: string | null
│   │   │       content: string
│   │   │       language: 'text' | 'latex'
│   │   │       diagnostics: Diagnostic[]
│   │   │     }
│   │   │   - ai: {
│   │   │       isProcessing: boolean
│   │   │       currentContext: AIContext | null
│   │   │       chatHistory: ChatMessage[]
│   │   │     }
│   │   │
│   │   └── slices/                    # 状态分片(可选)
│   │       ├── projectSlice.ts
│   │       ├── editorSlice.ts
│   │       └── aiSlice.ts
│   │
│   ├── services/                      # 服务层
│   │   ├── api.ts                     # Axios配置
│   │   │   - axios.create()
│   │   │   - 请求/响应拦截器
│   │   │   - 错误处理
│   │   │
│   │   ├── projectService.ts          # 项目API
│   │   │   - createProject()
│   │   │   - openProject()
│   │   │   - validateProject()
│   │   │   - getProjectStructure()
│   │   │
│   │   ├── fileService.ts             # 文件API
│   │   │   - listFiles()
│   │   │   - readFile()
│   │   │   - writeFile()
│   │   │   - createFile()
│   │   │   - deleteFile()
│   │   │
│   │   └── aiService.ts               # AI服务(重要!)
│   │       - analyzeIdea()           # 流式
│   │       - textToLatex()           # 同步
│   │       - continueWriting()       # 流式
│   │       - checkContent()          # 同步
│   │       - searchPapers()          # 同步
│   │       - generateCode()          # 同步
│   │       - streamHandler           # SSE处理
│   │
│   ├── hooks/                         # 自定义Hooks
│   │   ├── useProject.ts              # 项目管理Hook
│   │   │   - useCreateProject()
│   │   │   - useOpenProject()
│   │   │
│   │   ├── useEditor.ts               # 编辑器Hook
│   │   │   - useFileContent()
│   │   │   - useAutoSave()
│   │   │   - useDiagnostics()
│   │   │
│   │   ├── useAI.ts                   # AI Hook(关键!)
│   │   │   - useAIContext()          # 上下文感知
│   │   │   - useAIStreaming()        # 流式响应
│   │   │   - useRealtimeCheck()      # 实时检查
│   │   │
│   │   └── useWebSocket.ts            # WebSocket Hook
│   │       - useAIWebSocket()
│   │
│   ├── components/                    # 组件库
│   │   ├── layout/                    # 布局组件
│   │   │   ├── MainLayout.tsx         # 主布局
│   │   │   │   - Header.tsx          # 顶部栏
│   │   │   │   ├── Sidebar.tsx       # 左侧栏(文件树)
│   │   │   │   ├── EditorPanel.tsx   # 中间(编辑器)
│   │   │   │   └── AIPanel.tsx       # 右侧(AI助手)
│   │   │   │
│   │   │   └── ResizablePanel.tsx    # 可调整大小的面板
│   │   │
│   │   ├── project/                   # 项目管理组件
│   │   │   ├── ProjectSelector.tsx   # 项目选择器(关键!)
│   │   │   │   - 显示已打开项目
│   │   │   │   - 创建新项目按钮
│   │   │   │   - 打开项目按钮
│   │   │   │
│   │   │   └── CreateProjectModal.tsx
│   │   │       - 项目名称输入
│   │   │       - 存储位置选择
│   │   │
│   │   ├── files/                     # 文件浏览器组件
│   │   │   ├── FileTree.tsx           # 文件树(核心!)
│   │   │   │   - 递归渲染文件夹
│   │   │   │   - 展开/折叠
│   │   │   │   - 当前文件高亮
│   │   │   │
│   │   │   ├── FileNode.tsx           # 文件节点
│   │   │   │   - 图标
│   │   │   │   - 点击选择
│   │   │   │
│   │   │   └── FolderNode.tsx         # 文件夹节点
│   │   │       - 图标
│   │   │       - 展开/折叠
│   │   │
│   │   ├── editor/                    # 编辑器组件
│   │   │   ├── PaperEditor.tsx        # CodeMirror编辑器(核心!)
│   │   │   │   - CodeMirror 6配置
│   │   │   │   - LaTeX语言支持
│   │   │   │   - Linter集成
│   │   │   │   - 自动保存
│   │   │   │
│   │   │   ├── EditorTabs.tsx         # 标签页
│   │   │   │   - 多文件标签
│   │   │   │   - 关闭按钮
│   │   │   │
│   │   │   └── DiagnosticPanel.tsx   # 诊断面板
│   │   │       - 显示语法/逻辑错误
│   │   │       - 错误定位
│   │   │
│   │   ├── ai/                        # AI组件
│   │   │   ├── AIPanel.tsx            # AI助手面板(核心!)
│   │   │   │   - ContextAwareActions.tsx  # 上下文感知按钮
│   │   │   │   - ChatBox.tsx          # 聊天框
│   │   │   │   - StreamingResponse.tsx # 流式响应
│   │   │   │
│   │   │   ├── AIButton.tsx           # AI功能按钮
│   │   │   │   - 加载状态
│   │   │   │   - 禁用状态
│   │   │   │
│   │   │   └── ContextIndicator.tsx   # 上下文指示器
│   │   │       - 显示当前AI上下文
│   │   │
│   │   └── ui/                        # 基础UI组件
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Modal.tsx
│   │       └── Loading.tsx
│   │
│   ├── pages/                         # 页面组件
│   │   ├── ProjectSelectorPage.tsx    # 项目选择页
│   │   └── EditorPage.tsx             # 编辑器页
│   │
│   ├── types/                         # TypeScript类型
│   │   ├── index.ts                   # 导出所有类型
│   │   ├── project.ts                 # 项目相关类型
│   │   ├── file.ts                    # 文件相关类型
│   │   ├── ai.ts                      # AI相关类型
│   │   └── store.ts                   # 状态相关类型
│   │
│   ├── utils/                         # 工具函数
│   │   ├── formatters.ts              # 格式化工具
│   │   ├── validators.ts              # 验证工具
│   │   └── constants.ts               # 常量定义
│   │
│   └── styles/                        # 样式文件
│       ├── globals.css                # 全局样式
│       ├── editor.css                 # 编辑器样式
│       └── themes.css                 # 主题样式
│
├── public/                            # 静态资源
│   └── favicon.ico
│
├── index.html                         # HTML入口
├── package.json                       # 依赖配置
├── tsconfig.json                      # TypeScript配置
├── vite.config.ts                     # Vite配置
├── tailwind.config.js                 # Tailwind配置
└── postcss.config.js                  # PostCSS配置
```

---

## 🎯 核心功能模块深度设计

(此处省略了详细的代码实现,完整版请参考计划文件)

---

## 📝 实现阶段规划

### Phase 1: 基础框架 (第1-2周)

**目标**: 搭建可运行的基础架构

#### 后端任务 (5天)
- [ ] Day 1-2: 项目初始化
- [ ] Day 3-4: 项目管理API
- [ ] Day 5: 文件操作API

#### 前端任务 (5天)
- [ ] Day 1-2: 项目初始化
- [ ] Day 3-4: 状态管理
- [ ] Day 5: 基础布局

**验收标准**:
- ✅ 可以创建新项目
- ✅ 可以打开现有项目
- ✅ 显示三栏布局
- ✅ API文档可访问

### Phase 2: 核心编辑功能 (第3-4周)

**目标**: 实现文件浏览和编辑

#### 后端任务 (5天)
- [ ] 文件服务完善
- [ ] 文件列表API
- [ ] 文件树生成
- [ ] Windows路径处理

#### 前端任务 (7天)
- [ ] Day 1-3: 文件浏览器
- [ ] Day 4-7: CodeMirror集成

**验收标准**:
- ✅ 文件树正常显示
- ✅ 可以打开和编辑文件
- ✅ LaTeX语法高亮
- ✅ 自动保存工作

### Phase 3: AI功能集成 (第5-7周)

**目标**: 实现所有AI功能

#### 后端任务 (7天)
- [ ] Day 1-2: AI服务基础
- [ ] Day 3-7: AI功能实现

#### 前端任务 (7天)
- [ ] Day 1-2: AI服务层
- [ ] Day 3-4: 上下文感知
- [ ] Day 5-7: AI交互

**验收标准**:
- ✅ 所有AI功能可用
- ✅ 流式响应流畅
- ✅ 上下文感知正确
- ✅ 错误处理完善

### Phase 4: 实时检查与优化 (第8-10周)

**目标**: 实现实时检查和优化

#### 后端任务 (5天)
- [ ] WebSocket实时检查
- [ ] 性能优化
- [ ] 缓存机制

#### 前端任务 (7天)
- [ ] Day 1-3: 实时检查
- [ ] Day 4-7: 优化与完善

**验收标准**:
- ✅ 实时语法检查工作
- ✅ 性能良好
- ✅ 用户体验优秀
- ✅ 测试覆盖率>70%

---

## 🔑 关键技术点

### 1. Windows路径处理
使用`path.replace(/\\/g, '/')`统一路径分隔符

### 2. CodeMirror 6配置要点
- 使用Compartment实现动态语言切换
- 集成LaTeX语言支持
- 自定义linter实现AI驱动检查

### 3. SSE流式响应处理
使用Fetch API + ReadableStream处理服务端推送事件

### 4. 防抖与节流
编辑器内容变化后2秒才触发AI检查,避免频繁API调用

---

## ⚠️ 重要注意事项

### 1. 必须先打开项目
- 使用路由守卫强制执行
- 所有编辑器页面都需要检查`project.isOpen`

### 2. 文件路径监控
- 使用`useEffect`监听`editor.currentFile`变化
- 动态更新AI上下文

### 3. 防抖处理
- 编辑器内容变化后2秒才触发AI检查
- 避免频繁API调用

### 4. 错误处理
- 所有AI调用包含重试机制
- 提供降级方案

### 5. Windows兼容性
- 统一路径分隔符
- 测试所有文件操作

---

## 📚 参考资源

### 技术文档
- [FastAPI文档](https://fastapi.tiangolo.com/)
- [CodeMirror 6文档](https://codemirror.net/docs/)
- [通义千问API文档](https://help.aliyun.com/zh/dashscope/)
- [Zustand文档](https://docs.pmnd.rs/zustand/)

### 复用PaperReader2经验
- 配置管理(`config.py`)
- AI服务集成(`llm_service.py`)
- 前端状态管理模式
- Tailwind样式配置

---

## 🎯 快速开始清单

在开始编码前,请确保:

### 环境准备
- [ ] Node.js 18+ 已安装
- [ ] Python 3.10+ 已安装
- [ ] Git 已安装
- [ ] VS Code 或其他IDE已安装
- [ ] 阿里云通义千问API Key已获取(从paperreader2复制)

### 配置验证
- [ ] 验证`DASHSCOPE_API_KEY`环境变量已设置
- [ ] 验证paperreader2项目可以正常运行(参考现有配置)

### 工具安装
- [ ] `npm install -g vitest` (前端测试框架)
- [ ] `pip install pytest pytest-asyncio pytest-cov` (后端测试框架)
- [ ] (可选) Docker Desktop (用于容器化部署)

### 阅读顺序
1. 先阅读"项目概述"和"与PaperReader2的对比"
2. 理解"整体架构图"和技术栈选型
3. 查看"详细项目结构"
4. 深入阅读"核心功能模块深度设计"的代码示例
5. 参考"实施阶段规划"开始开发

---

**开发计划版本**: v1.0
**创建时间**: 2026-01-13
**预计完成**: 2026-03-27 (10周)
**项目根目录**: `C:\Users\xiaofeifei\Desktop\workspace\paperwriter\`

**下一步**:
1. ✅ 将本计划保存为 `devplan.md` (已完成!)
2. 创建项目目录结构
3. 开始Phase 1的实施!
