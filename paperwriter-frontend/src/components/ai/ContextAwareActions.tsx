/* 上下文感知 AI 按钮组件 */
import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/appStore';
import { aiService } from '@/services/aiService';
import { Loader2, Sparkles, FileText, Search, Code, CheckCircle } from 'lucide-react';

// AI 上下文类型定义
type AIContextType =
  | 'idea'
  | 'main_content'
  | 'citation'
  | 'code'
  | 'none';

// 根据文件路径确定 AI 上下文
function getAIContext(filePath: string | null): AIContextType {
  if (!filePath) return 'none';
  if (filePath.startsWith('idea/')) return 'idea';
  if (filePath.startsWith('主体/')) return 'main_content';
  if (filePath.startsWith('引用/')) return 'citation';
  if (filePath.startsWith('代码/')) return 'code';
  return 'none';
}

// 不同上下文的功能配置
const CONTEXT_FEATURES = {
  idea: [
    { id: 'analyze', label: '分析可行性', icon: Sparkles, color: 'bg-purple-100 text-purple-700 hover:bg-purple-200' },
  ],
  main_content: [
    { id: 'to_latex', label: '转 LaTeX', icon: FileText, color: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
    { id: 'continue', label: '续写内容', icon: Sparkles, color: 'bg-green-100 text-green-700 hover:bg-green-200' },
    { id: 'check', label: '检查内容', icon: CheckCircle, color: 'bg-orange-100 text-orange-700 hover:bg-orange-200' },
  ],
  citation: [
    { id: 'search', label: '搜索文献', icon: Search, color: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' },
  ],
  code: [
    { id: 'generate', label: '生成代码', icon: Code, color: 'bg-teal-100 text-teal-700 hover:bg-teal-200' },
  ],
  none: [],
};

export default function ContextAwareActions() {
  const currentFile = useAppStore((state) => state.editor.currentFile);
  const projectId = useAppStore((state) => state.project.id);
  const content = useAppStore((state) => state.editor.content);
  const setAIProcessing = useAppStore((state) => state.setAIProcessing);
  const [context, setContext] = useState<AIContextType>('none');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState('');

  // 更新上下文
  useEffect(() => {
    setContext(getAIContext(currentFile));
    setResult('');
  }, [currentFile]);

  const features = CONTEXT_FEATURES[context];

  // 执行 AI 功能
  const handleAction = async (featureId: string) => {
    if (!projectId) return;

    setIsLoading(true);
    setAIProcessing(true);
    setResult('');

    try {
      switch (featureId) {
        case 'analyze':
          await aiService.analyzeIdea(
            projectId,
            content,
            '',
            (chunk) => setResult((prev) => prev + chunk),
            () => {
              setIsLoading(false);
              setAIProcessing(false);
            },
            (error) => {
              setResult(`错误: ${error.message}`);
              setIsLoading(false);
              setAIProcessing(false);
            }
          );
          break;

        case 'to_latex':
          const latexResult = await aiService.textToLatex(projectId, content);
          setResult(latexResult.result);
          setIsLoading(false);
          setAIProcessing(false);
          break;

        case 'continue':
          await aiService.continueWriting(
            projectId,
            content,
            currentFile || '',
            (chunk) => setResult((prev) => prev + chunk),
            () => {
              setIsLoading(false);
              setAIProcessing(false);
            },
            (error) => {
              setResult(`错误: ${error.message}`);
              setIsLoading(false);
              setAIProcessing(false);
            }
          );
          break;

        case 'check':
          const checkResult = await aiService.checkContent(projectId, content, 'all');
          setResult(JSON.stringify(checkResult.diagnostics, null, 2));
          setIsLoading(false);
          setAIProcessing(false);
          break;

        case 'search':
          const keywords = content.split('\n').filter((line) => line.trim());
          const searchResult = await aiService.searchPapers(projectId, keywords, '');
          setResult(searchResult.result);
          setIsLoading(false);
          setAIProcessing(false);
          break;

        case 'generate':
          const codeResult = await aiService.generateCode(projectId, content, 'python');
          setResult(codeResult.result);
          setIsLoading(false);
          setAIProcessing(false);
          break;
      }
    } catch (error) {
      setResult(`错误: ${error instanceof Error ? error.message : '未知错误'}`);
      setIsLoading(false);
      setAIProcessing(false);
    }
  };

  if (context === 'none' || features.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-gray-400">
        选择文件后显示相关 AI 功能
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* 上下文指示器 */}
      <div className="mb-3">
        <span className="text-xs text-gray-500">当前上下文: </span>
        <span className="text-xs font-medium text-blue-600">
          {context === 'idea' && '想法'}
          {context === 'main_content' && '主体内容'}
          {context === 'citation' && '文献引用'}
          {context === 'code' && '代码'}
        </span>
      </div>

      {/* AI 功能按钮 */}
      <div className="grid grid-cols-1 gap-2">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <button
              key={feature.id}
              onClick={() => handleAction(feature.id)}
              disabled={isLoading}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 ${feature.color}`}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Icon className="w-4 h-4" />
              )}
              {feature.label}
            </button>
          );
        })}
      </div>

      {/* AI 响应结果 */}
      {result && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200 max-h-96 overflow-y-auto">
          <pre className="text-xs whitespace-pre-wrap font-mono">{result}</pre>
        </div>
      )}
    </div>
  );
}
