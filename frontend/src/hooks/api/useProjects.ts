import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ProjectCreate, projectsService, ProjectUpdate } from '../../api/services/projects.service';

// Query keys - centralized for consistency
export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (filters: string) => [...projectKeys.lists(), { filters }] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: number) => [...projectKeys.details(), id] as const,
};

// Hook to get all projects
export const useProjects = () => {
  return useQuery({
    queryKey: projectKeys.lists(),
    queryFn: () => projectsService.getAll(),
    staleTime: 5 * 60 * 1000, // Data fresh for 5 minutes
  });
};

// Hook to get single project
export const useProject = (id: number) => {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => projectsService.getById(id),
    enabled: !!id, // Only run if id exists
  });
};

// Hook to create project
export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProjectCreate) => projectsService.create(data),
    onSuccess: () => {
      // Invalidate and refetch projects list after creation
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
};

// Hook to update project
export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ProjectUpdate> }) =>
      projectsService.update(id, data),
    onSuccess: (updatedProject) => {
      // Update the specific project in cache
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(updatedProject.id) });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
};

// Hook to delete project
export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => projectsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
};