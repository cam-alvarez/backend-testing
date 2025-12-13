import { useDatasets } from "../../hooks/api/useDatasets";

interface DatasetSelectorProps {
  value: number | null;
  onChange: (datasetId: number | null) => void;
}

export const DatasetSelector = ({ value, onChange }: DatasetSelectorProps) => {
  const { data: datasets, isLoading, error } = useDatasets();

  if (error) {
    return (
      <div className="alert alert-error">
        <span>Error loading datasets: {error.message}</span>
      </div>
    );
  }

  return (
    <div className="form-control w-full">
      <label className="label">
        <span className="label-text font-semibold">Select Dataset</span>
        {isLoading && (
          <span className="label-text-alt">
            <span className="loading loading-spinner loading-xs"></span>
          </span>
        )}
      </label>
      <select
        className="select select-sm select-bordered w-full"
        value={value ?? ""}
        onChange={(e) =>
          onChange(e.target.value ? Number(e.target.value) : null)
        }
        disabled={isLoading}
      >
        <option value="">-- Select a dataset --</option>
        {datasets?.map((dataset) => (
          <option key={dataset.id} value={dataset.id}>
            {dataset.name} ({dataset.row_count.toLocaleString()} rows)
          </option>
        ))}
      </select>
    </div>
  );
};
