import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

const getProjects = async () => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  const response = await fetch("http://127.0.0.1:8000/api/projects");
  return response.json();
};

export default function OldApp() {
  const [projectId, setProjectId] = useState(null);
  const [isProjectSelected, setIsProjectSelected] = useState(false);

  const { data, isFetching, refetch, isError, error } = useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
  });

  function move_project_id(arr, old_index, new_index) {
    if (new_index >= arr.length) {
      var k = new_index - arr.length + 1;
      while (k--) {
        arr.push(undefined);
      }
    }
    arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
    return arr; // for testing
  }

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // const projectColumns = () => {
  //   let project_data = data?.find((project) => project.id === projectId) || {};
  //   let unsorted_project_columns = Object.keys(project_data);
  //   let id_column_index = unsorted_project_columns.indexOf("id");
  //   let project_columns = move_project_id(
  //     unsorted_project_columns,
  //     id_column_index,
  //     0
  //   );

  //   return project_columns;
  // };

  const projectColumns = (project: 0) => {
    if (data) {
      let project_data = data[project] || {};
      let unsorted_project_columns = Object.keys(project_data);
      let id_column_index = unsorted_project_columns.indexOf("id");
      let project_columns = move_project_id(
        unsorted_project_columns,
        id_column_index,
        0
      );
      return project_columns;
    }
  };

  const columnArray = projectColumns(0);

  if (isError) {
    return <span>Error: {error.message}</span>;
  }

  return (
    <>
      <div className="mt-5">
        <header className="flex flex-col w-full">
          <h1 className="text-3xl font-semibold text-center">
            React Query Backend Testing
          </h1>
          <div className="divider"></div>
        </header>

        {/* ALL PROJECTS */}

        <div className="flex justify-between items-end mx-10">
          <h2 className="text-xl font-medium">All Projects</h2>
          <div className="">
            {isFetching ? (
              <button className="btn btn-disabled">
                <span className="loading loading-spinner mr-2" /> Loading
                Projects
              </button>
            ) : (
              <button className="btn" onClick={() => refetch()}>
                Refetch Projects
              </button>
            )}
          </div>
        </div>

        <div className="mx-15 flex justify-center align-middle">
          {isFetching ? (
            <span></span>
          ) : (
            <div className="overflow-x-auto rounded-box border border-base-content/15 bg-base-100 mt-6">
              <table className="table">
                {/* head */}
                <thead>
                  <tr>
                    {columnArray?.map((element) => (
                      <th>{element}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* row 1 */}
                  {data?.map((project) => (
                    <tr>
                      <td>{project.id}</td>
                      <td>{project.name}</td>
                      <td>{project.description}</td>
                      <td>
                        {project.tags?.map((tag) => tag.name)?.join(", ")}
                      </td>
                      <td>
                        {project.datasets
                          ?.map((datasets) => datasets.name)
                          ?.join(", ")}
                      </td>
                      <td>{formatDate(project.created_at)}</td>
                      <td>{formatDate(project.updated_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="divider mx-10"></div>

        {/* PROJECT BY ID */}

        <div className="flex justify-between items-end mx-10">
          <h2 className="text-xl font-medium">Select to View Project</h2>

          <select
            defaultValue="Select Project"
            className="select"
            onChange={(e) => {
              {
                e.target.value
                  ? setIsProjectSelected(true)
                  : setIsProjectSelected(false);
              }
              setProjectId(Number(e.target.value));
            }}
          >
            <option disabled={true}>Select Project</option>

            {data?.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mx-15 pt-6 flex justify-center align-middle">
          {isProjectSelected ? (
            <div className="overflow-x-auto rounded-box border border-base-content/15 bg-base-100">
              <table className="table">
                {/* head */}
                <thead>
                  <tr>
                    {columnArray?.map((element) => (
                      <th>{element}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* row 1 */}
                  <tr>
                    <td>
                      {data?.find((project) => project.id === projectId)?.id}
                    </td>
                    <td>
                      {data?.find((project) => project.id === projectId)?.name}
                    </td>
                    <td>
                      {
                        data?.find((project) => project.id === projectId)
                          ?.description
                      }
                    </td>
                    <td>
                      {data
                        ?.find((project) => project.id === projectId)
                        ?.tags?.map((tag) => tag.name)
                        ?.join(", ")}
                    </td>
                    <td>
                      {data
                        ?.find((project) => project.id === projectId)
                        ?.datasets?.map((datasets) => datasets.name)
                        ?.join(", ")}
                    </td>
                    <td>
                      {formatDate(
                        data?.find((project) => project.id === projectId)
                          ?.created_at
                      )}
                    </td>
                    <td>
                      {
                        data?.find((project) => project.id === projectId)
                          ?.updated_at
                      }
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <span></span>
          )}
        </div>
      </div>
    </>
  );
}
