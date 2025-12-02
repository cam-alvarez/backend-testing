import { components } from '../../types/api.generated';
import { apiClient } from '../client';

export type Dataset = components['schemas']['DatasetResponse']

export const datasetsService = {

    // Get all datasets
    getAll: async (skip: number=0, limit: number = 20): Promise<Dataset[]> => {
        const response = await apiClient.get('/api/datasets', {
            params: { skip, limit},
        });
        return response.data;
    },

    // Get single dataset by ID
    getById: async (id: number): Promise<Dataset> => {
        const response = await apiClient.get(`/api/datasets/${id}`)
        return response.data
    },

    // Delete project
    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`/api/datasets/${id}`)
    },
}