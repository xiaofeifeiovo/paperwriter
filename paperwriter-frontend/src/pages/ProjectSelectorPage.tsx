/* 项目选择页 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService } from '@/services/projectService';
import { useAppStore } from '@/store/appStore';
import { FilePlus, FolderOpen } from 'lucide-react';

export default function ProjectSelectorPage() {
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const openProject = useAppStore((state) => state.openProject);

  // 创建项目
  const handleCreateProject = async () => {
    if (!projectName.trim()) return;

    setIsLoading(true);
    try {
      const result = await projectService.createProject({ name: projectName });

      // 更新状态
      openProject(
        result.project_id,
        result.name,
        result.root_path,
        result.structure
      );

      navigate('/editor');
    } catch (error) {
      alert(`创建项目失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 打开项目
  const handleOpenProject = async () => {
    const projectId = prompt('请输入项目ID:');
    if (!projectId) return;

    setIsLoading(true);
    try {
      const result = await projectService.openProject({ project_id: projectId });

      // 更新状态
      openProject(
        result.project_id,
        result.name || projectId,
        result.path,
        result.structure
      );

      navigate('/editor');
    } catch (error) {
      alert(`打开项目失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            PaperWriter
          </h1>
          <p className="text-xl text-gray-600">
            AI 驱动的学术论文写作编辑器
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 创建新项目 */}
          <button
            onClick={() => setShowCreateModal(true)}
            disabled={isLoading}
            className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-200 flex flex-col items-center gap-4 disabled:opacity-50"
          >
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <FilePlus className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">创建新项目</h2>
            <p className="text-gray-600 text-center">开始一篇新的学术论文写作</p>
          </button>

          {/* 打开现有项目 */}
          <button
            onClick={handleOpenProject}
            disabled={isLoading}
            className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-200 flex flex-col items-center gap-4 disabled:opacity-50"
          >
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
              <FolderOpen className="w-8 h-8 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">打开项目</h2>
            <p className="text-gray-600 text-center">继续之前的写作工作</p>
          </button>
        </div>

        {/* 创建项目弹窗 */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">创建新项目</h3>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="输入项目名称..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateProject();
                  if (e.key === 'Escape') setShowCreateModal(false);
                }}
              />
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setProjectName('');
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleCreateProject}
                  disabled={!projectName.trim() || isLoading}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isLoading ? '创建中...' : '创建'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
