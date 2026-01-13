/* 中间面板 - 编辑器区域 */
import { useEffect, useState, useCallback, useRef } from 'react';
import { useAppStore } from '@/store/appStore';
import { fileService } from '@/services/fileService';
import EditorTabs from './EditorTabs';
import PaperEditor from '../editor/PaperEditor';
import { Save } from 'lucide-react';

// 自动保存延迟（毫秒）
const AUTO_SAVE_DELAY = 2000;

export default function EditorPanel() {
  const currentFile = useAppStore((state) => state.editor.currentFile);
  const projectId = useAppStore((state) => state.project.id);
  const content = useAppStore((state) => state.editor.content);
  const setContent = useAppStore((state) => state.setContent);
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedContentRef = useRef('');

  // 加载文件内容
  useEffect(() => {
    if (!currentFile || !projectId) {
      setContent('');
      lastSavedContentRef.current = '';
      return;
    }

    const loadFile = async () => {
      setIsLoading(true);
      try {
        const result = await fileService.readFile({
          project_id: projectId,
          file_path: currentFile,
        });
        setContent(result.content);
        lastSavedContentRef.current = result.content;
        setSaveStatus('saved');
      } catch (error) {
        console.error('加载文件失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFile();
  }, [currentFile, projectId, setContent]);

  // 手动保存
  const handleSave = useCallback(async () => {
    if (!currentFile || !projectId || saveStatus === 'saving') return;

    setSaveStatus('saving');
    try {
      await fileService.writeFile({
        project_id: projectId,
        file_path: currentFile,
        content: content,
      });
      lastSavedContentRef.current = content;
      setSaveStatus('saved');
    } catch (error) {
      console.error('保存文件失败:', error);
      setSaveStatus('unsaved');
    }
  }, [currentFile, projectId, content, saveStatus]);

  // 自动保存逻辑
  useEffect(() => {
    // 清除之前的定时器
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // 如果内容未改变，不需要保存
    if (content === lastSavedContentRef.current) {
      return;
    }

    // 标记为未保存
    setSaveStatus('unsaved');

    // 设置自动保存定时器
    autoSaveTimerRef.current = setTimeout(() => {
      handleSave();
    }, AUTO_SAVE_DELAY);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [content, handleSave]);

  // 键盘快捷键 - Ctrl+S 保存
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  return (
    <main className="flex-1 flex flex-col bg-gray-50">
      {/* 标签页 */}
      <EditorTabs />

      {/* 保存状态指示器 */}
      <div className="h-8 bg-white border-b border-border flex items-center justify-between px-3">
        <div className="flex items-center gap-2">
          {saveStatus === 'saved' && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Save className="w-3 h-3" />
              已保存
            </span>
          )}
          {saveStatus === 'saving' && (
            <span className="text-xs text-blue-600 flex items-center gap-1">
              <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin" />
              保存中...
            </span>
          )}
          {saveStatus === 'unsaved' && (
            <span className="text-xs text-orange-600 flex items-center gap-1">
              未保存
            </span>
          )}
        </div>
        <div className="text-xs text-gray-400">
          Ctrl+S 快速保存
        </div>
      </div>

      {/* 编辑器区域 */}
      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm">加载中...</p>
            </div>
          </div>
        ) : currentFile ? (
          <PaperEditor onSave={handleSave} />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <p className="text-lg mb-2">未选择文件</p>
              <p className="text-sm">从左侧文件浏览器中选择一个文件开始编辑</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
