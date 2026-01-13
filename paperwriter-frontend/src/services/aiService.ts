/* AI 服务 API */
import api from './api';

// 流式响应处理器类型
export type StreamHandler = (chunk: string) => void;
export type StreamCompleteHandler = () => void;
export type StreamErrorHandler = (error: Error) => void;

export const aiService = {
  /**
   * 分析 idea 可行性（流式）
   */
  async analyzeIdea(
    projectId: string,
    ideaContent: string,
    projectContext = '',
    onChunk: StreamHandler,
    onComplete: StreamCompleteHandler,
    onError: StreamErrorHandler
  ) {
    try {
      const response = await fetch('/api/v1/ai/analyze-idea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          idea_content: ideaContent,
          project_context: projectContext,
        }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('无法获取响应流');
      }

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // 处理 SSE 格式
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);

            if (data === '[DONE]') {
              onComplete();
              return;
            }

            if (data.startsWith('[ERROR]')) {
              const errorMsg = data.slice(7);
              onError(new Error(errorMsg));
              return;
            }

            onChunk(data);
          }
        }
      }
    } catch (error) {
      onError(error as Error);
    }
  },

  /**
   * 文本转 LaTeX
   */
  async textToLatex(projectId: string, text: string): Promise<{ success: boolean; result: string }> {
    return api.post('/ai/text-to-latex', {
      project_id: projectId,
      text,
    });
  },

  /**
   * 续写论文内容（流式）
   */
  async continueWriting(
    projectId: string,
    currentContent: string,
    fileContext: string,
    onChunk: StreamHandler,
    onComplete: StreamCompleteHandler,
    onError: StreamErrorHandler
  ) {
    try {
      const response = await fetch('/api/v1/ai/continue-writing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          current_content: currentContent,
          file_context: fileContext,
        }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('无法获取响应流');
      }

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);

            if (data === '[DONE]') {
              onComplete();
              return;
            }

            if (data.startsWith('[ERROR]')) {
              const errorMsg = data.slice(7);
              onError(new Error(errorMsg));
              return;
            }

            onChunk(data);
          }
        }
      }
    } catch (error) {
      onError(error as Error);
    }
  },

  /**
   * 检查内容
   */
  async checkContent(
    projectId: string,
    content: string,
    checkType = 'all'
  ): Promise<{ success: boolean; diagnostics: any[] }> {
    return api.post('/ai/check-content', {
      project_id: projectId,
      content,
      check_type: checkType,
    });
  },

  /**
   * 搜索文献
   */
  async searchPapers(
    projectId: string,
    keywords: string[],
    field = ''
  ): Promise<{ success: boolean; result: string }> {
    return api.post('/ai/search-papers', {
      project_id: projectId,
      keywords,
      field,
    });
  },

  /**
   * 生成代码
   */
  async generateCode(
    projectId: string,
    description: string,
    language = 'python'
  ): Promise<{ success: boolean; result: string }> {
    return api.post('/ai/generate-code', {
      project_id: projectId,
      description,
      language,
    });
  },
};
