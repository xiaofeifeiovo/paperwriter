/* 编辑器标签页 */
import { X } from 'lucide-react';
import { useAppStore } from '@/store/appStore';

export default function EditorTabs() {
  const openTabs = useAppStore((state) => state.editor.openTabs);
  const activeTab = useAppStore((state) => state.editor.activeTab);
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  const removeTab = useAppStore((state) => state.removeTab);
  const setCurrentFile = useAppStore((state) => state.setCurrentFile);

  const handleClose = (filePath: string, index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    removeTab(filePath);
    if (activeTab === index) {
      const newActiveTab = index > 0 ? index - 1 : null;
      if (newActiveTab !== null && openTabs[newActiveTab]) {
        setActiveTab(newActiveTab);
        setCurrentFile(openTabs[newActiveTab]);
      } else {
        setCurrentFile(null);
      }
    }
  };

  if (openTabs.length === 0) {
    return null;
  }

  return (
    <div className="flex bg-white border-b border-border">
      {openTabs.map((filePath, index) => {
        const fileName = filePath.split('/').pop() || filePath;
        const isActive = activeTab === index;

        return (
          <div
            key={filePath}
            className={`flex items-center gap-2 px-4 py-2 text-sm border-r border-border cursor-pointer transition-colors ${
              isActive
                ? 'bg-blue-50 text-blue-600 border-b-2 border-b-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => {
              setActiveTab(index);
              setCurrentFile(filePath);
            }}
          >
            <span className="truncate max-w-[150px]">{fileName}</span>
            <button
              onClick={(e) => handleClose(filePath, index, e)}
              className={`p-0.5 rounded hover:bg-gray-200 transition-colors ${
                isActive ? 'hover:bg-blue-100' : ''
              }`}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
