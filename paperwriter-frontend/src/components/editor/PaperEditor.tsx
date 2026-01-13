/* CodeMirror 6 编辑器组件 - 核心编辑器 */
import { useEffect, useRef, useState } from 'react';
import { EditorState, Compartment } from '@codemirror/state';
import { EditorView, keymap, hoverTooltip } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { indentOnInput, bracketMatching, syntaxHighlighting } from '@codemirror/language';
import { oneDark } from '@codemirror/theme-one-dark';
import { lint, diagnosticCount } from '@codemirror/lint';
import { latex } from '@codemirror/lang-latex';
import type { Diagnostic } from '@/types';
import { useAppStore } from '@/store/appStore';
import { fileService } from '@/services/fileService';

// 语言配置 compartment
const languageConf = new Compartment();
// 主题配置 compartment
const themeConf = new Compartment();

interface PaperEditorProps {
  onSave?: () => void;
}

export default function PaperEditor({ onSave }: PaperEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const projectId = useAppStore((state) => state.project.id);
  const currentFile = useAppStore((state) => state.editor.currentFile);
  const content = useAppStore((state) => state.editor.content);
  const setContent = useAppStore((state) => state.setContent);
  const setLanguage = useAppStore((state) => state.setLanguage);
  const [isDark, setIsDark] = useState(false);

  // 检测文件类型
  const getFileLanguage = (filePath: string | null): 'text' | 'latex' => {
    if (!filePath) return 'text';
    if (filePath.endsWith('.tex')) return 'latex';
    if (filePath.endsWith('.md')) return 'latex'; // Markdown 也用 LaTeX 高亮
    return 'text';
  };

  // 初始化编辑器
  useEffect(() => {
    if (!containerRef.current) return;

    // 创建基础状态
    const startState = EditorState.create({
      doc: '',
      extensions: [
        keymap.of([...defaultKeymap, ...historyKeymap]),
        history(),
        indentOnInput(),
        bracketMatching(),
        EditorView.lineWrapping,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const newContent = update.state.doc.toString();
            setContent(newContent);
          }
        }),
        languageConf.of([]),
        themeConf.of(EditorView.theme({}, { dark: false })),
        EditorView.theme({
          '&': { height: '100%' },
          '.cm-scroller': { overflow: 'auto' },
          '.cm-content': { minHeight: '100%' },
        }),
      ],
    });

    // 创建编辑器视图
    const view = new EditorView({
      state: startState,
      parent: containerRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, [setContent]);

  // 更新编辑器内容
  useEffect(() => {
    if (!viewRef.current) return;

    const view = viewRef.current;
    const currentContent = view.state.doc.toString();

    if (content !== currentContent) {
      view.dispatch({
        changes: {
          from: 0,
          to: currentContent.length,
          insert: content,
        },
      });
    }
  }, [content]);

  // 更新语言支持
  useEffect(() => {
    if (!viewRef.current) return;

    const language = getFileLanguage(currentFile);
    setLanguage(language);

    const langExtension = language === 'latex'
      ? [latex(), syntaxHighlighting(latex())]
      : [];

    viewRef.current.dispatch({
      effects: languageConf.reconfigure(langExtension),
    });
  }, [currentFile, setLanguage]);

  // 切换主题
  const toggleTheme = () => {
    if (!viewRef.current) return;

    const newDark = !isDark;
    setIsDark(newDark);

    viewRef.current.dispatch({
      effects: themeConf.reconfigure(
        newDark ? oneDark : EditorView.theme({}, { dark: false })
      ),
    });
  };

  return (
    <div className="relative h-full flex flex-col">
      {/* 工具栏 */}
      <div className="h-10 border-b border-border bg-gray-50 flex items-center justify-between px-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">
            {currentFile || '未选择文件'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
            title="切换主题"
          >
            {isDark ? '☀️' : '🌙'}
          </button>
          <button
            onClick={onSave}
            className="px-3 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            保存 (Ctrl+S)
          </button>
        </div>
      </div>

      {/* 编辑器容器 */}
      <div ref={containerRef} className="flex-1 overflow-hidden" />
    </div>
  );
}
