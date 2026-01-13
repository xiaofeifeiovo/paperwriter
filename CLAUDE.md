# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Development Commands

### Backend (FastAPI)

```bash
cd paperwriter-backend

# Install dependencies
pip install -r requirements.txt

# Configure environment (set DASHSCOPE_API_KEY in .env)
cp .env.example .env

# Run development server
python run.py

# Run with uvicorn directly
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# API documentation available at http://localhost:8000/docs
```

### Frontend (React + Vite)

```bash
cd paperwriter-frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

---

## Architecture Overview

PaperWriter is an AI-powered academic paper writing editor with a **context-aware AI system** that provides different AI features based on file location.

### Key Architectural Pattern: Context-Aware AI

The core innovation is the **context-aware AI system**:

- **`idea/`** files → AI analyzes research feasibility
- **`主体/`** (main content) files → AI converts text to LaTeX, continues writing, checks content
- **`引用/`** (citation) files → AI searches related papers
- **`代码/`** (code) files → AI generates code

This pattern is implemented in:
- Frontend: `src/components/ai/ContextAwareActions.tsx` - Maps file paths to AI features
- Backend: `app/core/ai_service.py` - Core AI service with 6 distinct AI functions

### Project Structure Enforcement

**Mandatory project management**: Users MUST open/create a project before using any features. This is enforced via:
- Frontend route guard in `src/pages/EditorPage.tsx`
- Zustand store check `project.isOpen`

Standard project structure is auto-created:
```
project-{id}/
├── idea/           # Research ideas
├── 主体/            # Main content
├── 引用/            # Citations/references
└── 代码/            # Generated code
```

---

## Backend Architecture

### Service Layer Pattern

All business logic is in `app/core/`:

- **`project_service.py`** - Project lifecycle (create, validate, get tree)
- **`file_service.py`** - File operations with security checks (path traversal protection)
- **`ai_service.py`** - AI integration with dashscope SDK, includes retry logic via tenacity

### AI Service Implementation

`AIService` class wraps the **dashscope** (阿里云通义千问) SDK:

- Uses `@retry` decorator for automatic retries on connection errors
- Supports both streaming and non-streaming responses
- All AI methods are `async` and return either `str` or `AsyncGenerator[str, None]`

Six AI functions:
1. `analyze_idea()` - Stream: Feasibility analysis
2. `text_to_latex()` - Sync: Text to LaTeX conversion
3. `continue_writing()` - Stream: Content continuation
4. `check_content()` - Sync: Grammar/logic checking with diagnostics
5. `search_papers()` - Sync: Literature search
6. `generate_code()` - Sync: Code generation

### API Routing

Routes are in `app/api/v1/`:
- `project.py` - Project management endpoints
- `files.py` - File CRUD operations
- `ai.py` - AI endpoints (streaming endpoints return `StreamingResponse`)
- `websocket.py` - WebSocket for real-time AI checking

All routes are registered in `app/main.py`.

---

## Frontend Architecture

### State Management: Zustand Store

Single source of truth in `src/store/appStore.ts`:

```typescript
{
  project: { isOpen, id, name, path, structure },
  editor: { currentFile, content, language, diagnostics, openTabs, activeTab },
  ai: { isProcessing, currentContext, chatHistory }
}
```

**Important**: `closeProject()` resets both project AND editor state.

### Component Architecture

**Layout Components** (`src/components/layout/`):
- `Header.tsx` - Top bar with project info and close button
- `Sidebar.tsx` - File tree with create/delete file actions
- `EditorPanel.tsx` - CodeMirror editor with auto-save (2s delay)
- `AIPanel.tsx` - Right panel, imports from `@/components/ai/AIPanel.tsx`

**AI Components** (`src/components/ai/`):
- `ContextAwareActions.tsx` - **Core**: Maps file paths to AI buttons
- `AIPanel.tsx` - Chat interface with context-aware actions

### Services Layer

`src/services/` wraps API calls:
- `api.ts` - Axios instance with interceptors
- `projectService.ts`, `fileService.ts` - Standard REST calls
- `aiService.ts` - **Streaming support**: Uses `fetch()` + `ReadableStream` for SSE, NOT axios

### Editor Integration

CodeMirror 6 is in `src/components/editor/PaperEditor.tsx`:
- Uses `Compartment` for dynamic language switching (text ↔ LaTeX)
- Auto-save logic is in `EditorPanel.tsx`, not the editor itself

---

## Important Implementation Details

### Windows Path Handling

Use `path.replace(/\\/g, '/')` to normalize paths. File service has security checks to prevent path traversal attacks.

### Auto-Save

- 2-second debounce after content changes
- `Ctrl+S` triggers immediate save
- Save status indicator: "已保存" / "保存中..." / "未保存"

### WebSocket Real-Time Checking

- Endpoint: `WS /api/v1/stream?project_id=xxx`
- Frontend hook: `src/hooks/useWebSocket.ts`
- Supports bidirectional messaging for content checking

### Route Guards

Access to editor requires `project.isOpen === true`. This is checked in `EditorPage.tsx` with automatic redirect to `/project` if false.

---

## Testing

```bash
# Backend tests
cd paperwriter-backend
pytest

# Frontend tests (when implemented)
cd paperwriter-frontend
npm run test
```

---

## Environment Configuration

**Required**: Set `DASHSCOPE_API_KEY` in `paperwriter-backend/.env`

```env
DASHSCOPE_API_KEY=your_qwen_api_key_here
DASHSCOPE_MODEL=qwen-turbo
```

---

## Common Gotchas

1. **AI service requires valid API key** - Without it, all AI calls fail
2. **Project state is mandatory** - Always check `project.isOpen` before accessing editor features
3. **File paths are relative** - All file operations use paths relative to project root
4. **Streaming responses use Fetch API** - `aiService.ts` uses native `fetch()` for SSE, not axios
5. **CodeMirror language switching** - Uses `Compartment` pattern for dynamic language changes
