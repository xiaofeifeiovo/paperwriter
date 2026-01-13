/* 顶部栏组件 */
import { X } from 'lucide-react';
import { useAppStore } from '@/store/appStore';

interface HeaderProps {
  onCloseProject: () => void;
}

export default function Header({ onCloseProject }: HeaderProps) {
  const project = useAppStore((state) => state.project);

  return (
    <header className="h-14 border-b border-border bg-white flex items-center justify-between px-4 shrink-0">
      {/* 左侧 - 项目信息 */}
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-gray-900">PaperWriter</h1>
        <div className="h-6 w-px bg-border" />
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="font-medium">{project.name}</span>
          <span className="text-gray-400">|</span>
          <span className="text-xs text-gray-500">{project.id}</span>
        </div>
      </div>

      {/* 右侧 - 关闭项目按钮 */}
      <button
        onClick={onCloseProject}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <X className="w-4 h-4" />
        关闭项目
      </button>
    </header>
  );
}
