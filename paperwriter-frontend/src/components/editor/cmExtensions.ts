/* CodeMirror 6 基础配置和扩展 */
import { Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { linter, Diagnostic as CmDiagnostic } from '@codemirror/lint';
import type { Diagnostic } from '@/types';

/**
 * 将后端诊断信息转换为 CodeMirror 格式
 */
export function toCmDiagnostics(diagnostics: Diagnostic[]): CmDiagnostic[] {
  return diagnostics.map((d) => ({
    from: d.from.line * 1000 + d.from.ch, // 简化位置计算
    to: d.to.line * 1000 + d.to.ch,
    severity: d.severity,
    message: d.message,
  }));
}

/**
 * 创建 AI 驱动的 linter
 */
export function aiLinter(
  getDiagnostics: () => Promise<Diagnostic[]>
): Extension {
  return linter(async () => {
    try {
      const diagnostics = await getDiagnostics();
      return toCmDiagnostics(diagnostics);
    } catch (error) {
      console.error('AI Linter error:', error);
      return [];
    }
  });
}

/**
 * 自定义主题
 */
export const paperTheme = EditorView.theme({
  '&': {
    backgroundColor: '#ffffff',
    color: '#1a1a1a',
    fontSize: '14px',
  },
  '.cm-content': {
    padding: '12px 0',
    fontFamily: '"Fira Code", "Consolas", monospace',
    lineHeight: '1.6',
  },
  '.cm-line': {
    padding: '0 12px',
  },
  '.cm-activeLine': {
    backgroundColor: '#f0f9ff',
  },
  '.cm-selectionBackground': {
    backgroundColor: '#b3d9ff',
  },
  '.cm-selectionMatch': {
    backgroundColor: '#ffe066',
  },
  '.cm-cursor': {
    borderLeftColor: '#3b82f6',
    borderLeftWidth: '2px',
  },
  '.cm-focused': {
    outline: 'none',
  },
});

/**
 * 暗色主题
 */
export const paperDarkTheme = EditorView.theme({
  '&': {
    backgroundColor: '#1a1a2e',
    color: '#eaeaea',
  },
  '.cm-content': {
    padding: '12px 0',
    fontFamily: '"Fira Code", "Consolas", monospace',
    lineHeight: '1.6',
  },
  '.cm-line': {
    padding: '0 12px',
  },
  '.cm-activeLine': {
    backgroundColor: '#16213e',
  },
  '.cm-selectionBackground': {
    backgroundColor: '#0f3460',
  },
  '.cm-cursor': {
    borderLeftColor: '#e94560',
    borderLeftWidth: '2px',
  },
});

/**
 * 行号扩展
 */
export const lineNumbersExtension = EditorView.lineNumbers({
  domEventHandlers: {
    click: (view, line, event) => {
      // 可以在这里添加行号点击处理
    },
  },
});
