/* 项目相关类型 */
export interface Project {
  id: string;
  name: string;
  path: string;
  isOpen: boolean;
  structure: FolderTree | null;
  createdAt: Date;
}

export interface FolderTree {
  name: string;
  path: string;
  type: 'folder' | 'file';
  extension?: string;
  children: FolderTree[];
}

export interface ProjectCreateRequest {
  name: string;
  location?: string;
}

export interface ProjectOpenRequest {
  project_id: string;
}

export interface ProjectStructureResponse {
  project_id: string;
  name: string;
  root_path: string;
  structure: FolderTree;
  created_at: string;
}
