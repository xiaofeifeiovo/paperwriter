/* 右侧面板 - AI 助手 */
import { MessageSquare } from 'lucide-react';

export default function AIPanel() {
  return (
    <aside className="w-80 border-l border-border bg-white flex flex-col">
      <div className="px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          AI 助手
        </h2>
      </div>

      {/* AI 上下文感知按钮组 */}
      <div className="p-4 border-b border-border">
        <p className="text-xs text-gray-500 mb-3">根据当前文件位置选择 AI 功能</p>
        <div className="grid grid-cols-2 gap-2">
          <button className="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
            分析可行性
          </button>
          <button className="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
            文本转 LaTeX
          </button>
          <button className="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
            续写内容
          </button>
          <button className="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
            搜索文献
          </button>
          <button className="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
            检查内容
          </button>
          <button className="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
            生成代码
          </button>
        </div>
      </div>

      {/* 聊天区域 */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="text-center text-sm text-gray-400 py-8">
          AI 助手即将推出...
        </div>
      </div>
    </aside>
  );
}
