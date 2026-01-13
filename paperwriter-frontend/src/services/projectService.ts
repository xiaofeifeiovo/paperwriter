/* 项目服务 API */
import api from './api';
import type {
  ProjectCreateRequest,
  ProjectOpenRequest,
  ProjectStructureResponse,
} from '@/types';

export const projectService = {
  // 创建项目
  async createProject(data: ProjectCreateRequest): Promise<ProjectStructureResponse> {
    return api.post('/project/create', data);
  },

  // 打开项目
  async openProject(data: ProjectOpenRequest) {
    return api.post('/project/open', data);
  },

  // 验证项目
  async validateProject(projectId: string) {
    return api.get('/project/validate', {
      params: { project_id: projectId },
    });
  },

  // 获取项目结构
  async getProjectStructure(projectId: string) {
    return api.get('/project/structure', {
      params: { project_id: projectId },
    });
  },

  // 关闭项目
  async closeProject(projectId: string) {
    return api.post('/project/close', null, {
      params: { project_id: projectId },
    });
  },
};
