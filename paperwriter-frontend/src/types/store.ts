/* 状态相关类型 */
import type { Project, FolderTree } from './project';
import type { Diagnostic } from './ai';

export interface AppState {
  // 项目状态
  project: {
    isOpen: boolean;
    id: string | null;
    name: string | null;
    path: string | null;
    structure: FolderTree | null;
  };

  // 编辑器状态
  editor: {
    currentFile: string | null;
    content: string;
    language: 'text' | 'latex';
    diagnostics: Diagnostic[];
    openTabs: string[];
    activeTab: number | null;
  };

  // AI 状态
  ai: {
    isProcessing: boolean;
    currentContext: string | null;
    chatHistory: Array<{ role: string; content: string }>;
  };
}
