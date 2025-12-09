import { useQuery } from '@tanstack/react-query';
import { DatasetDataParams, datasetDataService } from '../../api/services/datasetdata.service';

// Query keys for dataset data
export const datasetDataKeys = {
  all: ['datasetData'] as const,
  dataset: (id: number) => [...datasetDataKeys.all, id] as const,
  datasetWithParams: (id: number, params?: DatasetDataParams) =>
    [...datasetDataKeys.dataset(id), params] as const,
};

// Hook to get paginated dataset data
export const useDatasetData = (
  datasetId: number | null,
  params?: DatasetDataParams,
  options?: {
    enabled?: boolean;
  }
) => {
  return useQuery({
    queryKey: datasetDataKeys.datasetWithParams(datasetId!, params),
    queryFn: () => datasetDataService.getData(datasetId!, params),
    enabled: !!datasetId && (options?.enabled !== false),
    staleTime: 5 * 60 * 1000, // Data fresh for 5 minutes
  });
};

// Hook to get ALL dataset data (fetches all rows)
// Be careful with large datasets!
export const useAllDatasetData = (
  datasetId: number | null,
  options?: {
    enabled?: boolean;
  }
) => {
  return useQuery({
    queryKey: [...datasetDataKeys.dataset(datasetId!), 'all'],
    queryFn: () => datasetDataService.getAllData(datasetId!),
    enabled: !!datasetId && (options?.enabled !== false),
    staleTime: 10 * 60 * 1000, // Data fresh for 10 minutes
    // Cache for longer since this could be expensive
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  });
};

// Hook to get dataset data with automatic refetch when datasetId changes
export const useDatasetDataForChart = (datasetId: number | null) => {
  const { data, isLoading, error, refetch } = useAllDatasetData(
    datasetId,
    // { skip: 0, limit: 1000 }, // Default to first 1000 rows for charts
    { enabled: !!datasetId }
  );

  return {
    data,
    isLoading,
    error,
    refetch,
    // Helper properties for charting
    columns: data?.columns ?? [],
    columnTypes: data?.column_types ?? {},
    rows: data?.rows ?? [],
    totalRows: data?.total_rows ?? 0,
  };
};