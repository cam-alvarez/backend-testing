import { apiClient } from '../client';

// Types for dataset data - these match our backend response
export interface DatasetData {
  dataset_id: number;
  dataset_name: string;
  total_rows: number;
  columns: string[];
  column_types: Record<string, 'numeric' | 'datetime' | 'categorical' | 'text'>;
  rows: Record<string, any>[];
}

export interface DatasetDataParams {
  skip?: number;
  limit?: number;
}

// Dataset data service for charting
export const datasetDataService = {
  // Get dataset data for charting
  getData: async (
    datasetId: number,
    params?: DatasetDataParams
  ): Promise<DatasetData> => {
    const response = await apiClient.get(`/api/datasets/${datasetId}/data`, {
      params: {
        skip: params?.skip ?? 0,
        limit: params?.limit ?? 100,
      },
    });
    return response.data;
  },

  // Get all data (fetches all rows in batches if needed)
  getAllData: async (datasetId: number): Promise<DatasetData> => {
    // First, get the first batch to know total rows
    const firstBatch = await datasetDataService.getData(datasetId, {
      skip: 0,
      limit: 1000,
    });

    // If total rows <= 1000, we're done
    if (firstBatch.total_rows <= 1000) {
      return firstBatch;
    }

    // Otherwise, fetch remaining batches
    const allRows = [...firstBatch.rows];
    let fetched = firstBatch.rows.length;

    while (fetched < firstBatch.total_rows) {
      const batch = await datasetDataService.getData(datasetId, {
        skip: fetched,
        limit: 1000,
      });
      allRows.push(...batch.rows);
      fetched += batch.rows.length;
    }

    return {
      ...firstBatch,
      rows: allRows,
    };
  },
};