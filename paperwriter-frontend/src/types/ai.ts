/* AI 相关类型 */
import type { FileNode } from './file';

export type DiagnosticSeverity = 'info' | 'warning' | 'error';

export interface Diagnostic {
  from: { line: number; ch: number };
  to: { line: number; ch: number };
  severity: DiagnosticSeverity;
  message: string;
}

export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export type AIContext =
  | { type: 'idea'; file: string }
  | { type: 'main_content'; file: string }
  | { type: 'citation'; file: string }
  | { type: 'code'; file: string }
  | null;

export interface AIRequest {
  project_id: string;
  context: Record<string, unknown>;
}

export interface AIResponse {
  success: boolean;
  data: Record<string, unknown>;
  diagnostics: Diagnostic[];
  message?: string;
}
