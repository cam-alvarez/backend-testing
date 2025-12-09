import { ColumnType } from "../../utils/columnTypeUtils";

interface ColumnSelectorProps {
  label: string;
  columns: string[];
  columnTypes: Record<string, ColumnType>;
  value: string | null;
  onChange: (column: string | null) => void;
  filterTypes?: ColumnType[];
  helpText?: string;
  required?: boolean;
}

export const ColumnSelector = ({
  label,
  columns,
  columnTypes,
  value,
  onChange,
  filterTypes,
  helpText,
  required = false,
}: ColumnSelectorProps) => {
  // Filter columns by type if specified
  const availableColumns = filterTypes
    ? columns.filter((col) => filterTypes.includes(columnTypes[col]))
    : columns;

  return (
    <div className="form-control w-full">
      <label className="label">
        <span className="label-text font-semibold">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </span>
        {helpText && (
          <span className="label-text-alt text-xs opacity-70">{helpText}</span>
        )}
      </label>
      <select
        className="select select-bordered w-full"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        disabled={availableColumns.length === 0}
      >
        <option value="">-- Select column --</option>
        {availableColumns.map((col) => (
          <option key={col} value={col}>
            {col}{" "}
            <span className="text-xs opacity-60">({columnTypes[col]})</span>
          </option>
        ))}
      </select>
      {availableColumns.length === 0 && (
        <label className="label">
          <span className="label-text-alt text-warning">
            No suitable columns available
            {filterTypes && ` (need: ${filterTypes.join(", ")})`}
          </span>
        </label>
      )}
    </div>
  );
};
