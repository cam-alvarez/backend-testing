import {
  ChartBarIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { useDatasetDataForChart } from "../../hooks/api/useDatasetData";
import {
  getColumnStats,
  transformDataForChart,
} from "../../utils/chart.data.utils";
import { ChartConfig, DEFAULT_CHART_CONFIG } from "../../utils/chart.types";
import { getSuggestedAxes } from "../../utils/columnTypeUtils";
import { BarChartVisualization } from "./BarChartVisualization";
import { ChartOptions } from "./ChartOptions";
import { ColumnSelector } from "./ColumnSelector";
import { DatasetSelector } from "./DatasetSelector";

export const ChartBuilder = () => {
  const [config, setConfig] = useState<ChartConfig>(DEFAULT_CHART_CONFIG);

  // Fetch dataset data
  const { data, isLoading, error, columns, columnTypes, rows, totalRows } =
    useDatasetDataForChart(config.datasetId);

  // Auto-suggest axes when dataset changes
  useEffect(() => {
    if (columns.length > 0 && !config.xAxis && !config.yAxis) {
      const suggested = getSuggestedAxes(columns, columnTypes);
      setConfig((prev) => ({
        ...prev,
        xAxis: suggested.xAxis,
        yAxis: suggested.yAxis,
      }));
    }
  }, [columns, columnTypes]);

  // Transform data for chart
  const transformedData =
    config.xAxis && config.yAxis && rows.length > 0
      ? transformDataForChart(
          rows,
          config.xAxis,
          config.yAxis,
          config.barMode,
          config.groupBy,
          config.sortBy,
          config.limit
        )
      : { data: [], dataKeys: [] };

  // Get statistics for Y-axis column
  const yAxisStats =
    config.yAxis && rows.length > 0 ? getColumnStats(rows, config.yAxis) : null;

  // Check if chart can be rendered
  const canRenderChart =
    config.datasetId &&
    config.xAxis &&
    config.yAxis &&
    rows.length > 0 &&
    transformedData.data.length > 0;

  // Check if grouped/stacked mode requires groupBy
  const needsGroupBy =
    (config.barMode === "grouped" || config.barMode === "stacked") &&
    !config.groupBy;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">📊 Bar Chart Builder</h1>
        <p className="text-base-content/70">
          Create interactive bar charts from your datasets with grouping and
          stacking
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Configuration */}
        <div className="lg:col-span-1 space-y-6">
          {/* Dataset Selection */}
          <div className="collapse bg-base-200">
            <input type="checkbox" />
            <h2 className="collapse-title card-title text-lg">
              1. Select Dataset
            </h2>
            <div className="collapse-content">
              <DatasetSelector
                value={config.datasetId}
                onChange={(datasetId) =>
                  setConfig((prev) => ({
                    ...prev,
                    datasetId,
                    xAxis: null,
                    yAxis: null,
                    groupBy: null,
                  }))
                }
              />
            </div>
          </div>

          {/* Column Selection */}
          {config.datasetId && (
            <div className="collapse bg-base-200">
              <input type="checkbox" />
              <h2 className="collapse-title card-title text-lg">
                2. Select Axes
              </h2>
              <div className="collapse-content">
                {isLoading ? (
                  <div className="flex justify-center p-4">
                    <span className="loading loading-spinner"></span>
                  </div>
                ) : error ? (
                  <div className="alert alert-error">
                    <span>Error: {error.message}</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <ColumnSelector
                      label="X-Axis (Categories)"
                      columns={columns}
                      columnTypes={columnTypes}
                      value={config.xAxis}
                      onChange={(xAxis) =>
                        setConfig((prev) => ({ ...prev, xAxis }))
                      }
                      filterTypes={["categorical", "text", "datetime"]}
                      helpText="Categorical data for bar labels"
                      required={true}
                    />

                    <ColumnSelector
                      label="Y-Axis (Values)"
                      columns={columns}
                      columnTypes={columnTypes}
                      value={config.yAxis}
                      onChange={(yAxis) =>
                        setConfig((prev) => ({ ...prev, yAxis }))
                      }
                      filterTypes={["numeric"]}
                      helpText="Numeric data for bar heights"
                      required={true}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Chart Options */}
          {config.datasetId && config.xAxis && config.yAxis && (
            <div className="collapse bg-base-200">
              <input type="checkbox" />
              <h2 className="collapse-title card-title text-lg">
                3. Chart Options
              </h2>
              <div className="collapse-content">
                <ChartOptions
                  barMode={config.barMode}
                  onBarModeChange={(barMode) => {
                    setConfig((prev) => ({
                      ...prev,
                      barMode,
                      groupBy: barMode === "simple" ? null : prev.groupBy,
                    }));
                  }}
                  groupBy={config.groupBy}
                  onGroupByChange={(groupBy) =>
                    setConfig((prev) => ({ ...prev, groupBy }))
                  }
                  columns={columns}
                  columnTypes={columnTypes}
                  sortBy={config.sortBy}
                  onSortByChange={(sortBy) =>
                    setConfig((prev) => ({ ...prev, sortBy }))
                  }
                  limit={config.limit}
                  onLimitChange={(limit) =>
                    setConfig((prev) => ({ ...prev, limit }))
                  }
                  showLegend={config.showLegend}
                  onShowLegendChange={(showLegend) =>
                    setConfig((prev) => ({ ...prev, showLegend }))
                  }
                  showGrid={config.showGrid}
                  onShowGridChange={(showGrid) =>
                    setConfig((prev) => ({ ...prev, showGrid }))
                  }
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Chart Visualization */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chart Preview */}
          <div className="collapse bg-base-200">
            <input type="checkbox" />
            <h2 className="collapse-title card-title text-lg">Chart Preview</h2>
            <div className="collapse-content">
              {/* Validation Messages */}
              {!config.datasetId && (
                <div className="alert alert-info">
                  <InformationCircleIcon className="h-6 w-6 stroke-2 " />

                  <span>Select a dataset to get started</span>
                </div>
              )}

              {config.datasetId && (!config.xAxis || !config.yAxis) && (
                <div className="alert alert-warning">
                  <ExclamationTriangleIcon className="h-6 w-6 stroke-2 " />

                  <span>Select both X-axis and Y-axis columns</span>
                </div>
              )}

              {needsGroupBy && (
                <div className="alert alert-warning">
                  <ExclamationTriangleIcon className="h-6 w-6 stroke-2 " />
                  <span>
                    {config.barMode === "grouped" ? "Grouped" : "Stacked"} mode
                    requires a "Group By" column
                  </span>
                </div>
              )}

              {/* Chart */}
              {canRenderChart && !needsGroupBy ? (
                <BarChartVisualization
                  data={transformedData.data}
                  dataKeys={transformedData.dataKeys}
                  barMode={config.barMode}
                  xAxisLabel={config.xAxis || undefined}
                  yAxisLabel={config.yAxis || undefined}
                  colors={config.colors}
                  showLegend={config.showLegend}
                  showGrid={config.showGrid}
                />
              ) : (
                !config.datasetId &&
                !needsGroupBy && (
                  <div className="flex items-center justify-center h-96 bg-base-300 rounded-lg">
                    <div className="text-center opacity-50">
                      <ChartBarIcon className="size-24 stroke-1 mx-auto" />
                      <p className="text-lg">Your chart will appear here</p>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Statistics Panel */}
          {yAxisStats && canRenderChart && (
            <div className="collapse bg-base-200">
              <input type="checkbox" />
              <h2 className="collapse-title card-title text-lg">Statistics</h2>
              <div className="collapse-content">
                <div className="stats bg-base-100 lg:stats-horizontal shadow">
                  <div className="stat">
                    <div className="stat-title">Total Data Points</div>
                    <div className="stat-value text-2xl">
                      {yAxisStats.count.toLocaleString()}
                    </div>
                    <div className="stat-desc">
                      From {totalRows.toLocaleString()} rows
                    </div>
                  </div>

                  <div className="stat">
                    <div className="stat-title">Sum</div>
                    <div className="stat-value text-2xl">
                      {yAxisStats.sum.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </div>

                  <div className="stat">
                    <div className="stat-title">Average</div>
                    <div className="stat-value text-2xl">
                      {yAxisStats.mean.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </div>

                  <div className="stat">
                    <div className="stat-title">Range</div>
                    <div className="stat-value text-2xl">
                      {yAxisStats.min.toLocaleString()} -{" "}
                      {yAxisStats.max.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
