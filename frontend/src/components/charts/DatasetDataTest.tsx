import { useState } from "react";
import { useDatasetDataForChart } from "../../hooks/api/useDatasetData";
import { useDatasets } from "../../hooks/api/useDatasets";
import {
  getCategoricalColumns,
  getDateTimeColumns,
  getNumericColumns,
  getSuggestedAxes,
} from "../../utils/columnTypeUtils";

export const DatasetDataTest = () => {
  const [datasetId, setDatasetId] = useState<number | null>(1); // Change to your dataset ID
  const [isDatasetSelected, setIsDatasetSelected] = useState(false);

  const { data: datasets } = useDatasets();
  const { data, isLoading, error, columns, columnTypes, rows, totalRows } =
    useDatasetDataForChart(datasetId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
        <span className="ml-4">Loading dataset data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="alert alert-error">
          <span>Error loading dataset: {error.message}</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-4">
        <div className="alert alert-warning">
          <span>No data available. Please select a dataset.</span>
        </div>
      </div>
    );
  }

  const numericCols = getNumericColumns(columns, columnTypes);
  const categoricalCols = getCategoricalColumns(columns, columnTypes);
  const datetimeCols = getDateTimeColumns(columns, columnTypes);
  const suggestedAxes = getSuggestedAxes(columns, columnTypes);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Dataset Data Test</h2>
        <div className="form-control">
          <select
            className="select"
            onChange={(e) => {
              {
                e.target.value
                  ? setIsDatasetSelected(true)
                  : setIsDatasetSelected(false);
              }
              setDatasetId(Number(e.target.value));
            }}
          >
            <option disabled={true}>Select Dataset</option>

            {datasets?.map((data) => (
              <option
                key={data.id}
                value={data.id}
                selected={data.id === datasetId}
              >
                {data.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="stats shadow mb-4 w-full">
        <div className="stat">
          <div className="stat-title">Dataset Name</div>
          <div className="stat-value text-2xl">{data.dataset_name}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Total Rows</div>
          <div className="stat-value">{totalRows.toLocaleString()}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Loaded Rows</div>
          <div className="stat-value">{rows.length.toLocaleString()}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Columns</div>
          <div className="stat-value">{columns.length}</div>
        </div>
      </div>

      {/* Column Type Breakdown */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="card bg-primary text-primary-content">
          <div className="card-body">
            <h3 className="card-title text-lg">📊 Numeric Columns</h3>
            <div className="text-3xl font-bold">{numericCols.length}</div>
            <ul className="text-sm mt-2 space-y-1">
              {numericCols.slice(0, 5).map((col) => (
                <li key={col} className="truncate">
                  • {col}
                </li>
              ))}
              {numericCols.length > 5 && (
                <li className="font-bold">
                  ... +{numericCols.length - 5} more
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="card bg-secondary text-secondary-content">
          <div className="card-body">
            <h3 className="card-title text-lg">🏷️ Categorical Columns</h3>
            <div className="text-3xl font-bold">{categoricalCols.length}</div>
            <ul className="text-sm mt-2 space-y-1">
              {categoricalCols.slice(0, 5).map((col) => (
                <li key={col} className="truncate">
                  • {col}
                </li>
              ))}
              {categoricalCols.length > 5 && (
                <li className="font-bold">
                  ... +{categoricalCols.length - 5} more
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="card bg-accent text-accent-content">
          <div className="card-body">
            <h3 className="card-title text-lg">📅 DateTime Columns</h3>
            <div className="text-3xl font-bold">{datetimeCols.length}</div>
            <ul className="text-sm mt-2 space-y-1">
              {datetimeCols.slice(0, 5).map((col) => (
                <li key={col} className="truncate">
                  • {col}
                </li>
              ))}
              {datetimeCols.length > 5 && (
                <li className="font-bold">
                  ... +{datetimeCols.length - 5} more
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Suggested Axes */}
      <div className="alert alert-info mb-4">
        <div className="w-full">
          <h4 className="font-bold text-lg mb-2">💡 Suggested Chart Axes</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-semibold">X-Axis (Categories):</span>{" "}
              <span className="badge badge-lg">
                {suggestedAxes.xAxis || "None available"}
              </span>
            </div>
            <div>
              <span className="font-semibold">Y-Axis (Values):</span>{" "}
              <span className="badge badge-lg">
                {suggestedAxes.yAxis || "None available"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* All Column Types Table */}
      <div className="mt-6">
        <h3 className="text-lg font-bold mb-2">Column Types Overview</h3>
        <div className="overflow-x-auto">
          <table className="table table-sm table-zebra">
            <thead>
              <tr>
                <th>#</th>
                <th>Column Name</th>
                <th>Detected Type</th>
                <th>Sample Value</th>
              </tr>
            </thead>
            <tbody>
              {columns.map((col, idx) => (
                <tr key={col}>
                  <td>{idx + 1}</td>
                  <td className="font-semibold">{col}</td>
                  <td>
                    <span
                      className={`badge badge-sm ${
                        columnTypes[col] === "numeric"
                          ? "badge-primary"
                          : columnTypes[col] === "categorical"
                          ? "badge-secondary"
                          : columnTypes[col] === "datetime"
                          ? "badge-accent"
                          : "badge-ghost"
                      }`}
                    >
                      {columnTypes[col]}
                    </span>
                  </td>
                  <td className="text-sm opacity-70">
                    {rows[0]?.[col] !== undefined
                      ? String(rows[0][col]).slice(0, 30)
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sample Data Preview */}
      <div className="mt-6">
        <h3 className="text-lg font-bold mb-2">
          Sample Data Preview (First 10 Rows)
        </h3>
        <div className="overflow-x-auto">
          <table className="table table-sm table-pin-rows">
            <thead>
              <tr>
                <th>Row</th>
                {columns.map((col) => (
                  <th key={col} className="whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 10).map((row, i) => (
                <tr key={i}>
                  <td className="font-semibold">{i + 1}</td>
                  {columns.map((col) => (
                    <td key={col} className="text-sm">
                      {row[col] !== null && row[col] !== undefined
                        ? String(row[col]).slice(0, 50)
                        : "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Success Message */}
      <div className="alert alert-success mt-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="stroke-current shrink-0 h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div>
          <h3 className="font-bold">Phase 2 Complete! ✅</h3>
          <div className="text-sm">
            Data layer is working correctly. Ready to build chart components in
            Phase 3!
          </div>
        </div>
      </div>
    </div>
  );
};
