import { useState } from "react";
import type { Project } from "../../api/services/projects.service";
import { useDatasets, useDeleteDataset } from "../../hooks/api/useDatasets";
import {
  useCreateProject,
  useDeleteProject,
  useProjects,
} from "../../hooks/api/useProjects";
import { DynamicTable } from "../common/DynamicTable";

export default function ProjectsList() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Fetch projects using our custom hook - explicitly type the data
  const { data: projects, isLoading, error, refetch } = useProjects();

  // Mutations
  const createProject = useCreateProject();
  const deleteProject = useDeleteProject();

  // Dataset Fetch & Mutations
  const { data: datasets } = useDatasets();
  const deleteDataset = useDeleteDataset();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();

    createProject.mutate(
      { name, description, tags: [] },
      {
        onSuccess: () => {
          alert("Project created!");
          setName("");
          setDescription("");
        },
        onError: (error) => {
          alert("Error: " + error.message);
        },
      }
    );
  };

  const handleProjectDelete = (id: number, itemName: string) => {
    if (confirm(`Delete "${itemName}"?`)) {
      deleteProject.mutate(id);
    }
  };

  const handleDatasetDelete = (id: number, itemName: string) => {
    if (confirm(`Delete "${itemName}"?`)) {
      deleteDataset.mutate(id);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
        <span className="ml-4">Loading projects...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-10 mt-5">
        <div className="alert alert-error">
          <span>Error: {error.message}</span>
        </div>
        <button onClick={() => refetch()} className="btn btn-primary mt-4">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="mt-5">
      <header className="flex flex-col w-full">
        <h1 className="text-3xl font-semibold text-center">
          Projects (New Architecture)
        </h1>
        <div className="divider"></div>
      </header>

      {/* Create Form */}
      {/* <div>
        <div className="mx-10 mb-8">
          <h2 className="text-xl font-medium mb-4">Create New Project</h2>
          <form onSubmit={handleCreate} className="card bg-base-200 p-6">
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Project Name</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="input input-bordered"
                placeholder="My Awesome Project"
              />
            </div>

            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Description</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="textarea textarea-bordered"
                placeholder="Optional description..."
                rows={3}
              />
            </div>

            <button
              type="submit"
              disabled={createProject.isPending}
              className="btn btn-primary"
            >
              {createProject.isPending ? (
                <>
                  <span className="loading loading-spinner" />
                  Creating...
                </>
              ) : (
                "Create Project"
              )}
            </button>
          </form>
        </div>
      </div> */}

      {/* Projects Table */}
      <div className="mx-10">
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-xl font-medium">
            All Projects ({projects?.length || 0})
          </h2>
          <button onClick={() => refetch()} className="btn btn-sm">
            Refresh
          </button>
        </div>

        {!projects || projects.length === 0 ? (
          <div className="alert alert-info">
            <span>
              No projects found. Create one above or check console for errors.
            </span>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-box border border-base-content/15 bg-base-100">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Tags</th>
                  <th>Datasets</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project: Project) => (
                  <tr key={project.id}>
                    <td>{project.id}</td>
                    <td className="font-semibold">{project.name}</td>
                    <td>{project.description || "-"}</td>
                    <td>
                      {project.tags && project.tags.length > 0 ? (
                        <div className="flex gap-1 flex-wrap">
                          {project.tags.map((tag) => (
                            <span
                              key={tag.id}
                              className="badge badge-primary badge-sm"
                            >
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>
                      {project.datasets && project.datasets.length > 0
                        ? project.datasets.map((d) => d.name).join(", ")
                        : "-"}
                    </td>
                    <td>{formatDate(project.created_at)}</td>
                    <td>
                      <button
                        onClick={() =>
                          handleProjectDelete(project.id, project.name)
                        }
                        disabled={deleteProject.isPending}
                        className="btn btn-error btn-sm"
                      >
                        {deleteProject.isPending ? (
                          <span className="loading loading-spinner loading-xs" />
                        ) : (
                          "Delete"
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <DynamicTable
        data={datasets}
        title={"All Datasets"}
        handle={handleDatasetDelete}
        action={deleteDataset}
      />
    </div>
  );
}

// const data_element = {
//   name: 'Project 1',
//   description: 'The first project created for the backend testing api',
//   id: 1,
//   tags: [],
//   datasets: [
//     {
//       id: 1,
//       name: 'GSS',
//       filename: 'gssnet.csv',
//       projects: [
//         {
//           id: 1,
//           name: 'Project 1',
//         },
//       ],
//     },
//   ],
//   created_at: '2025-11-05T13:54:30.521360-05:00',
//   updated_at: null,
// };

// const columnArray = [
//   'id',
//   'name',
//   'description',
//   'tags',
//   'datasets',
//   'created_at',
//   'updated_at',
// ];

// const data_map = new Map(Object.entries(data_element));

// const column = columnArray[1];

// for (const column in columnArray) {
//   const column_name = columnArray[column];
//   let data_by_column = data_map.get(column_name);

//   if (Array.isArray(data_by_column) && !data_by_column.length) {
//     data_by_column = "-";
//   }

//   if (data_by_column === "") {
//     data_by_column = "-"
//   }

//   if (typeof data_by_column === "object"){

//   }

//   if (!data_by_column){

//   }

//   console.log(data_by_column);
// }

// // Log to console
// // console.log('Column Value:', column);
// // console.log(data_map.get(column));
// // console.log(data_element);
