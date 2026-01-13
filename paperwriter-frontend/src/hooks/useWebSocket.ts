/* WebSocket Hook - 实时 AI 检查 */
import { useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '@/store/appStore';

type WebSocketMessageHandler = (data: any) => void;
type WebSocketErrorHandler = (error: Error) => void;
type WebSocketCloseHandler = () => void;

interface UseWebSocketOptions {
  onMessage?: WebSocketMessageHandler;
  onError?: WebSocketErrorHandler;
  onClose?: WebSocketCloseHandler;
  reconnect?: boolean;
  reconnectInterval?: number;
}

export function useAIWebSocket(options: UseWebSocketOptions = {}) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const projectId = useAppStore((state) => state.project.id);
  const setDiagnostics = useAppStore((state) => state.setDiagnostics);

  const {
    onMessage,
    onError,
    onClose,
    reconnect = true,
    reconnectInterval = 3000,
  } = options;

  // 连接 WebSocket
  const connect = useCallback(() => {
    if (!projectId) return;

    try {
      const wsUrl = `ws://localhost:8000/api/v1/stream?project_id=${projectId}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket 已连接');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // 处理诊断信息
          if (data.type === 'diagnostics') {
            setDiagnostics(data.data || []);
          }

          // 调用自定义消息处理器
          if (onMessage) {
            onMessage(data);
          }
        } catch (error) {
          console.error('解析 WebSocket 消息失败:', error);
        }
      };

      ws.onerror = (event) => {
        console.error('WebSocket 错误:', event);
        if (onError) {
          onError(new Error('WebSocket 连接错误'));
        }
      };

      ws.onclose = () => {
        console.log('WebSocket 已关闭');

        if (onClose) {
          onClose();
        }

        // 自动重连
        if (reconnect && projectId) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('尝试重新连接 WebSocket...');
            connect();
          }, reconnectInterval);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('创建 WebSocket 连接失败:', error);
      if (onError) {
        onError(error as Error);
      }
    }
  }, [projectId, onMessage, onError, onClose, reconnect, reconnectInterval, setDiagnostics]);

  // 断开连接
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  // 发送消息
  const send = useCallback((message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket 未连接，无法发送消息');
    }
  }, []);

  // 项目 ID 变化时重新连接
  useEffect(() => {
    if (projectId) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [projectId, connect, disconnect]);

  return {
    send,
    disconnect,
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
  };
}

// 专用的实时检查 Hook
export function useRealtimeCheck() {
  const { send, isConnected } = useAIWebSocket();
  const content = useAppStore((state) => state.editor.content);
  const currentFile = useAppStore((state) => state.editor.currentFile);

  // 检查内容
  const checkContent = useCallback((checkContent: string, checkType = 'all') => {
    if (!isConnected) return;

    send({
      type: 'check_content',
      content: checkContent,
      check_type: checkType,
    });
  }, [send, isConnected]);

  // 分析 idea
  const analyzeIdea = useCallback((idea: string, context = '') => {
    if (!isConnected) return;

    send({
      type: 'analyze',
      idea,
      context,
    });
  }, [send, isConnected]);

  // 续写
  const continueWriting = useCallback((currentContent: string, fileContext = '') => {
    if (!isConnected) return;

    send({
      type: 'continue',
      current_content: currentContent,
      file_context: fileContext,
    });
  }, [send, isConnected]);

  return {
    checkContent,
    analyzeIdea,
    continueWriting,
    isConnected,
  };
}
