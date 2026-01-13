/* 文件相关类型 */
export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  extension?: string;
}

export interface FileReadRequest {
  project_id: string;
  file_path: string;
}

export interface FileWriteRequest {
  project_id: string;
  file_path: string;
  content: string;
  encoding?: string;
}

export interface FileCreateRequest {
  project_id: string;
  file_path: string;
  content?: string;
  file_type?: 'file' | 'folder';
}

export interface FileReadResponse {
  success: boolean;
  content: string;
}

export interface FileListResponse {
  files: FileNode[];
}
