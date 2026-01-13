/* 文件创建/删除模态框组件 */
import { useState } from 'react';
import { X, FilePlus, FolderPlus, Trash2 } from 'lucide-react';
import { fileService } from '@/services/fileService';
import { useAppStore } from '@/store/appStore';

interface FileActionModalProps {
  onClose: () => void;
  type: 'create' | 'delete';
  initialPath?: string;
}

export default function FileActionModal({ onClose, type, initialPath = '' }: FileActionModalProps) {
  const projectId = useAppStore((state) => state.project.id);
  const updateStructure = useAppStore((state) => state.updateStructure);
  const structure = useAppStore((state) => state.project.structure);

  const [filePath, setFilePath] = useState(initialPath);
  const [contentType, setContentType] = useState<'file' | 'folder'>('file');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !filePath.trim()) return;

    setIsLoading(true);
    try {
      if (type === 'create') {
        await fileService.createFile({
          project_id: projectId,
          file_path: filePath,
          content,
          file_type: contentType,
        });
      } else {
        await fileService.deleteFile(projectId, filePath);
      }

      // 刷新项目结构
      const { projectService } = await import('@/services/projectService');
      const result = await projectService.getProjectStructure(projectId);
      updateStructure(result);

      onClose();
    } catch (error) {
      alert(`操作失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-lg font-semibold text-gray-900">
            {type === 'create' ? '创建' : '删除'} {contentType === 'folder' ? '文件夹' : '文件'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="p-6">
          {type === 'create' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                类型
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="file"
                    checked={contentType === 'file'}
                    onChange={(e) => setContentType(e.target.value as 'file' | 'folder')}
                    className="w-4 h-4 text-blue-600"
                  />
                  <FilePlus className="w-4 h-4" />
                  <span className="text-sm">文件</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="folder"
                    checked={contentType === 'folder'}
                    onChange={(e) => setContentType(e.target.value as 'file' | 'folder')}
                    className="w-4 h-4 text-blue-600"
                  />
                  <FolderPlus className="w-4 h-4" />
                  <span className="text-sm">文件夹</span>
                </label>
              </div>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {type === 'create' ? '文件/文件夹路径' : '文件路径'}
            </label>
            <input
              type="text"
              value={filePath}
              onChange={(e) => setFilePath(e.target.value)}
              placeholder="example: idea/new_idea.md"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              相对于项目根目录的路径
            </p>
          </div>

          {type === 'create' && contentType === 'file' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                初始内容（可选）
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="输入初始文件内容..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
            </div>
          )}

          {type === 'delete' && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                此操作不可撤销，确认删除？
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${
                type === 'delete'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? '处理中...' : type === 'create' ? '创建' : '删除'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
