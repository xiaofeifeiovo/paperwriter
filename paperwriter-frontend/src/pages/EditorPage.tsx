/* 编辑器页 - 主布局 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/appStore';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import EditorPanel from '@/components/layout/EditorPanel';
import AIPanel from '@/components/ai/AIPanel';

export default function EditorPage() {
  const navigate = useNavigate();
  const { project, closeProject } = useAppStore();

  // 路由守卫 - 必须先打开项目
  useEffect(() => {
    if (!project.isOpen) {
      navigate('/project');
    }
  }, [project.isOpen, navigate]);

  if (!project.isOpen) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      {/* 顶部栏 */}
      <Header onCloseProject={closeProject} />

      {/* 主内容区 - 三栏布局 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧栏 - 文件浏览器 */}
        <Sidebar />

        {/* 中间 - 编辑器 */}
        <EditorPanel />

        {/* 右侧栏 - AI 助手 */}
        <AIPanel />
      </div>
    </div>
  );
}
