import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { datasetsService } from '../../api/services/datasets.service'

export const datasetKeys = {
    all: ['datasets'] as const,
    lists: () => [...datasetKeys.all, 'list'] as const,
    list: (filters: string) => [...datasetKeys.lists(), {filters}] as const,
    details: () => [...datasetKeys.all, "detail"] as const,
    detail: (id: number) => [...datasetKeys.details(), id] as const,
}

// Hook to get all datasets
export const useDatasets = () => {
    return useQuery({
        queryKey: datasetKeys.lists(),
        queryFn: () => datasetsService.getAll(),
        staleTime: 5 * 60 * 1000, // Data fresh for 5 minutes
    })
}

// Hook to get single dataset
export const useDataset = (id: number) => {
    return useQuery({
        queryKey: datasetKeys.detail(id),
        queryFn: () => datasetsService.getById(id),
        enabled: !!id
    })
}
// Hook to delete dataset
export const useDeleteDataset = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => datasetsService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: datasetKeys.lists()})
        },
    })
}

