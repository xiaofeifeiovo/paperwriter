/* Zustand 状态管理 - 主 Store */
import { create } from 'zustand';
import type { AppState, FolderTree, Diagnostic } from '@/types';

interface AppStore extends AppState {
  // 项目操作
  openProject: (id: string, name: string, path: string, structure: FolderTree) => void;
  closeProject: () => void;
  updateStructure: (structure: FolderTree) => void;

  // 编辑器操作
  setCurrentFile: (filePath: string | null) => void;
  setContent: (content: string) => void;
  setLanguage: (language: 'text' | 'latex') => void;
  setDiagnostics: (diagnostics: Diagnostic[]) => void;
  addTab: (filePath: string) => void;
  removeTab: (filePath: string) => void;
  setActiveTab: (index: number) => void;

  // AI 操作
  setAIProcessing: (isProcessing: boolean) => void;
  setAIContext: (context: string | null) => void;
  addChatMessage: (role: string, content: string) => void;
  clearChatHistory: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  // 初始状态
  project: {
    isOpen: false,
    id: null,
    name: null,
    path: null,
    structure: null,
  },
  editor: {
    currentFile: null,
    content: '',
    language: 'text',
    diagnostics: [],
    openTabs: [],
    activeTab: null,
  },
  ai: {
    isProcessing: false,
    currentContext: null,
    chatHistory: [],
  },

  // 项目操作
  openProject: (id, name, path, structure) =>
    set((state) => ({
      project: {
        isOpen: true,
        id,
        name,
        path,
        structure,
      },
    })),

  closeProject: () =>
    set({
      project: {
        isOpen: false,
        id: null,
        name: null,
        path: null,
        structure: null,
      },
      editor: {
        currentFile: null,
        content: '',
        language: 'text',
        diagnostics: [],
        openTabs: [],
        activeTab: null,
      },
    }),

  updateStructure: (structure) =>
    set((state) => ({
      project: { ...state.project, structure },
    })),

  // 编辑器操作
  setCurrentFile: (filePath) =>
    set((state) => {
      // 如果文件不在标签页中，添加它
      const newTabs = filePath && !state.editor.openTabs.includes(filePath)
        ? [...state.editor.openTabs, filePath]
        : state.editor.openTabs;

      return {
        editor: {
          ...state.editor,
          currentFile: filePath,
          openTabs: newTabs,
          activeTab: filePath ? newTabs.indexOf(filePath) : null,
        },
      };
    }),

  setContent: (content) =>
    set((state) => ({
      editor: { ...state.editor, content },
    })),

  setLanguage: (language) =>
    set((state) => ({
      editor: { ...state.editor, language },
    })),

  setDiagnostics: (diagnostics) =>
    set((state) => ({
      editor: { ...state.editor, diagnostics },
    })),

  addTab: (filePath) =>
    set((state) => {
      if (state.editor.openTabs.includes(filePath)) {
        return state;
      }
      return {
        editor: {
          ...state.editor,
          openTabs: [...state.editor.openTabs, filePath],
        },
      };
    }),

  removeTab: (filePath) =>
    set((state) => {
      const newTabs = state.editor.openTabs.filter((t) => t !== filePath);
      const newActiveTab =
        state.editor.activeTab !== null
          ? newTabs.findIndex((t) => t === state.editor.openTabs[state.editor.activeTab])
          : null;
      return {
        editor: {
          ...state.editor,
          openTabs: newTabs,
          activeTab: newActiveTab >= 0 ? newActiveTab : newTabs.length - 1 >= 0 ? newTabs.length - 1 : null,
        },
      };
    }),

  setActiveTab: (index) =>
    set((state) => ({
      editor: {
        ...state.editor,
        activeTab: index,
        currentFile: state.editor.openTabs[index] || null,
      },
    })),

  // AI 操作
  setAIProcessing: (isProcessing) =>
    set((state) => ({
      ai: { ...state.ai, isProcessing },
    })),

  setAIContext: (context) =>
    set((state) => ({
      ai: { ...state.ai, currentContext: context },
    })),

  addChatMessage: (role, content) =>
    set((state) => ({
      ai: {
        ...state.ai,
        chatHistory: [...state.ai.chatHistory, { role, content }],
      },
    })),

  clearChatHistory: () =>
    set((state) => ({
      ai: { ...state.ai, chatHistory: [] },
    })),
}));
