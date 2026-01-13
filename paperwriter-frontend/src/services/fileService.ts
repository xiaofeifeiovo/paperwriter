/* 文件服务 API */
import api from './api';
import type {
  FileReadRequest,
  FileWriteRequest,
  FileCreateRequest,
  FileReadResponse,
  FileListResponse,
} from '@/types';

export const fileService = {
  // 列出文件
  async listFiles(projectId: string, folderPath = ''): Promise<FileListResponse> {
    return api.get('/files/list', {
      params: { project_id: projectId, folder_path: folderPath },
    });
  },

  // 读取文件
  async readFile(data: FileReadRequest): Promise<FileReadResponse> {
    return api.post('/files/read', data);
  },

  // 写入文件
  async writeFile(data: FileWriteRequest): Promise<{ success: boolean; message: string }> {
    return api.post('/files/write', data);
  },

  // 创建文件
  async createFile(data: FileCreateRequest): Promise<{ success: boolean; message: string }> {
    return api.post('/files/create', data);
  },

  // 删除文件
  async deleteFile(projectId: string, filePath: string) {
    return api.delete('/files/delete', {
      data: { project_id: projectId, file_path: filePath },
    });
  },
};
