import { components } from '../../types/api.generated';
import { apiClient } from '../client';

// Extract types from generated file
export type Project = components['schemas']['ProjectResponse'];
export type ProjectCreate = components['schemas']['ProjectCreate'];
export type ProjectUpdate = components['schemas']['ProjectUpdate'];

// Project-related API calls
export const projectsService = {
  // Get all projects
  getAll: async (skip: number = 0, limit: number = 20): Promise<Project[]> => {
    const response = await apiClient.get('/api/projects', {
      params: { skip, limit },
    });
    return response.data;
  },

  // Get single project by ID
  getById: async (id: number): Promise<Project> => {
    const response = await apiClient.get(`/api/projects/${id}`);
    return response.data;
  },

  // Create new project
  create: async (data: ProjectCreate): Promise<Project> => {
    const response = await apiClient.post('/api/projects', data);
    return response.data;
  },

  // Update project
  update: async (id: number, data: Partial<ProjectUpdate>): Promise<Project> => {
    const response = await apiClient.patch(`/api/projects/${id}`, data);
    return response.data;
  },

  // Delete project
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/projects/${id}`);
  },
};