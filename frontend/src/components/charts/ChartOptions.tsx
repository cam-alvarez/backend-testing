import { BarChartMode } from "../../utils/chart.types";
import { ColumnType } from "../../utils/columnTypeUtils";
import { ColumnSelector } from "./ColumnSelector";

interface ChartOptionsProps {
  barMode: BarChartMode;
  onBarModeChange: (mode: BarChartMode) => void;
  groupBy: string | null;
  onGroupByChange: (column: string | null) => void;
  columns: string[];
  columnTypes: Record<string, ColumnType>;
  sortBy: "none" | "ascending" | "descending";
  onSortByChange: (sort: "none" | "ascending" | "descending") => void;
  limit: number | null;
  onLimitChange: (limit: number | null) => void;
  showLegend: boolean;
  onShowLegendChange: (show: boolean) => void;
  showGrid: boolean;
  onShowGridChange: (show: boolean) => void;
}

export const ChartOptions = ({
  barMode,
  onBarModeChange,
  groupBy,
  onGroupByChange,
  columns,
  columnTypes,
  sortBy,
  onSortByChange,
  limit,
  onLimitChange,
  showLegend,
  onShowLegendChange,
  showGrid,
  onShowGridChange,
}: ChartOptionsProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">Chart Options</h3>

      {/* Bar Chart Mode */}
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text font-semibold">Bar Chart Mode</span>
        </label>
        <div className="join w-full">
          <button
            className={`btn join-item flex-1 ${
              barMode === "simple" ? "btn-primary" : "btn-outline"
            }`}
            onClick={() => onBarModeChange("simple")}
          >
            Simple
          </button>
          <button
            className={`btn join-item flex-1 ${
              barMode === "grouped" ? "btn-primary" : "btn-outline"
            }`}
            onClick={() => onBarModeChange("grouped")}
          >
            Grouped
          </button>
          <button
            className={`btn join-item flex-1 ${
              barMode === "stacked" ? "btn-primary" : "btn-outline"
            }`}
            onClick={() => onBarModeChange("stacked")}
          >
            Stacked
          </button>
        </div>
        <label className="label">
          <span className="label-text-alt">
            {barMode === "simple" && "Single bar per category"}
            {barMode === "grouped" && "Multiple bars side-by-side per category"}
            {barMode === "stacked" && "Stacked bars per category"}
          </span>
        </label>
      </div>

      {/* Group By Column (only for grouped/stacked) */}
      {(barMode === "grouped" || barMode === "stacked") && (
        <ColumnSelector
          label="Group By"
          columns={columns}
          columnTypes={columnTypes}
          value={groupBy}
          onChange={onGroupByChange}
          filterTypes={["categorical", "text"]}
          helpText="Column to group/stack by"
          required={true}
        />
      )}

      {/* Sort By */}
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text font-semibold">Sort Bars</span>
        </label>
        <select
          className="select select-bordered w-full"
          value={sortBy}
          onChange={(e) =>
            onSortByChange(
              e.target.value as "none" | "ascending" | "descending"
            )
          }
        >
          <option value="none">No sorting (original order)</option>
          <option value="ascending">Ascending (low to high)</option>
          <option value="descending">Descending (high to low)</option>
        </select>
      </div>

      {/* Limit Number of Bars */}
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text font-semibold">Limit Bars Shown</span>
        </label>
        <input
          type="number"
          className="input input-bordered w-full"
          placeholder="No limit"
          value={limit ?? ""}
          onChange={(e) =>
            onLimitChange(e.target.value ? Number(e.target.value) : null)
          }
          min={1}
        />
        <label className="label">
          <span className="label-text-alt">
            Show top N bars (leave empty for all)
          </span>
        </label>
      </div>

      {/* Display Options */}
      <div className="divider">Display</div>

      <div className="form-control">
        <label className="label cursor-pointer justify-start gap-4">
          <input
            type="checkbox"
            className="checkbox checkbox-primary"
            checked={showLegend}
            onChange={(e) => onShowLegendChange(e.target.checked)}
          />
          <span className="label-text font-semibold">Show Legend</span>
        </label>
      </div>

      <div className="form-control">
        <label className="label cursor-pointer justify-start gap-4">
          <input
            type="checkbox"
            className="checkbox checkbox-primary"
            checked={showGrid}
            onChange={(e) => onShowGridChange(e.target.checked)}
          />
          <span className="label-text font-semibold">Show Grid Lines</span>
        </label>
      </div>
    </div>
  );
};
