/* 左侧边栏 - 文件浏览器 */
import { useState } from 'react';
import { useAppStore } from '@/store/appStore';
import { File, Folder, FolderOpen, FilePlus, Trash2 } from 'lucide-react';
import FileActionModal from '../files/FileActionModal';

export default function Sidebar() {
  const structure = useAppStore((state) => state.project.structure);
  const currentFile = useAppStore((state) => state.editor.currentFile);
  const setCurrentFile = useAppStore((state) => state.setCurrentFile);
  const [showFileModal, setShowFileModal] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'delete'>('create');

  // 递归渲染文件树
  const renderTree = (node: any, depth = 0) => {
    const isFile = node.type === 'file';
    const Icon = isFile ? File : node.path.includes('/') ? FolderOpen : Folder;
    const isActive = currentFile === node.path;

    return (
      <div key={node.path}>
        <div
          className={`group flex items-center justify-between gap-2 px-3 py-1.5 cursor-pointer text-sm hover:bg-gray-100 transition-colors ${
            isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
          }`}
          style={{ paddingLeft: `${depth * 16 + 12}px` }}
          onClick={() => isFile && setCurrentFile(node.path)}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Icon className="w-4 h-4 shrink-0" />
            <span className="truncate">{node.name}</span>
          </div>

          {/* 删除按钮（仅显示在 hover 时） */}
          {isFile && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setModalType('delete');
                setShowFileModal(true);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-opacity"
            >
              <Trash2 className="w-3 h-3 text-red-500" />
            </button>
          )}
        </div>
        {node.children && node.children.map((child: any) => renderTree(child, depth + 1))}
      </div>
    );
  };

  return (
    <aside className="w-64 border-r border-border bg-white flex flex-col">
      {/* 标题栏 */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
          文件浏览器
        </h2>
        <button
          onClick={() => {
            setModalType('create');
            setShowFileModal(true);
          }}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          title="创建新文件"
        >
          <FilePlus className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* 文件树 */}
      <div className="flex-1 overflow-y-auto py-2">
        {structure ? (
          renderTree(structure)
        ) : (
          <div className="px-4 py-8 text-center text-sm text-gray-500">
            加载中...
          </div>
        )}
      </div>

      {/* 文件操作模态框 */}
      {showFileModal && (
        <FileActionModal
          type={modalType}
          initialPath={modalType === 'delete' && currentFile ? currentFile : ''}
          onClose={() => setShowFileModal(false)}
        />
      )}
    </aside>
  );
}
