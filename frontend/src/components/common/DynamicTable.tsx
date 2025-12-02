import { UseMutationResult } from "@tanstack/react-query";
import type { Dataset } from "../../api/services/datasets.service";
import { Project } from "../../api/services/projects.service";

interface StringArray {
  [index: string]: unknown;
  name: string;
  id: number;
}

export const DynamicTable = (props: {
  data?: Dataset[] | Project[];
  title: string;
  handle: Function;
  action: UseMutationResult<void, Error, number, unknown>;
}) => {
  function move_project_id(
    arr: string[],
    old_index: number,
    new_index: number
  ) {
    if (new_index >= arr.length) {
      var k = new_index - arr.length + 1;
      while (k--) {
        arr.push("");
      }
    }
    let id_column = arr.splice(old_index, 1)[0];
    if (typeof id_column === "string") {
      arr.splice(new_index, 0, id_column);
    } else {
    }

    return arr; // for testing
  }

  const formatDate = (dateString: string) => {
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

  const projectColumns = (id: number) => {
    if (props.data) {
      let project_data = props.data[id] || {};
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

  const columnArray = projectColumns(0) || [];

  return (
    <div className="mt-5">
      <div className="mx-10">
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-xl font-medium">
            {props.title} ({props.data?.length || 0})
          </h2>
          <button className="btn btn-sm">Refresh</button>
        </div>

        {/* Table */}

        <div className="overflow-x-auto rounded-box border border-base-content/15 bg-base-100">
          <table className="table">
            <thead>
              <tr>
                {columnArray?.map((column: string) => (
                  <th key={column}>
                    {column
                      .replace("_", " ")
                      .replace(/(^|\s)[a-z]/gi, (l) => l.toUpperCase())}
                  </th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {props.data?.map((rowItem: StringArray) => {
                let updatedValues: string[] = [];

                columnArray.forEach((column) => {
                  let valueToPush = rowItem[column];

                  if (
                    typeof valueToPush === "string" &&
                    column.includes("at")
                  ) {
                    valueToPush = formatDate(valueToPush);
                  }

                  if (!valueToPush) {
                    valueToPush = "-";
                  }

                  if (Array.isArray(valueToPush) && !valueToPush.length) {
                    valueToPush = "-";
                  }

                  if (Array.isArray(valueToPush)) {
                    let result: string[] = [];
                    valueToPush?.forEach((key) => {
                      if (key.name) {
                        result.push(key.name);
                      } else {
                        result = [valueToPush] as string[];
                      }
                    });

                    if (result.length > 4) {
                      let sliced_result: string[] = result.slice(0, 4);
                      valueToPush =
                        sliced_result.join(", ") +
                        ` .... +${result.length - 4} more`;
                    } else {
                      valueToPush = [result.join(", ")];
                    }
                  }

                  updatedValues.push(valueToPush as string);
                });

                return (
                  <tr key={rowItem.id}>
                    {updatedValues.map(
                      (rowCells, index) => (
                        console.log("updated values", updatedValues),
                        (<td key={index}>{rowCells}</td>)
                      )
                    )}
                    <td>
                      <button
                        onClick={() => {
                          props.handle(rowItem.id, rowItem.name),
                            console.log(rowItem.name, rowItem.id);
                        }}
                        disabled={props.action.isPending}
                        className="btn btn-error btn-sm"
                      >
                        {props.action.isPending ? (
                          <span className="loading loading-spinner loading-xs" />
                        ) : (
                          "Delete"
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
