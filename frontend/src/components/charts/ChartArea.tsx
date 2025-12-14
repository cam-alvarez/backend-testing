import {
  Cog6ToothIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { ChartBarIcon } from "@heroicons/react/24/solid";
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

export const ChartArea = () => {
  const [settingsIsOpen, setSettingsIsOpen] = useState(true);
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
    <div className="grow card bg-base-200">
      <div className="card-body">
        <div className="flex gap-4">
          <div className="grow rounded-md">
            <div className="flex justify-between just pl-2 py-1 ">
              <div className="self-start card-title">Chart Preview</div>
              <button
                onClick={() =>
                  settingsIsOpen == true
                    ? setSettingsIsOpen(false)
                    : setSettingsIsOpen(true)
                }
                className="btn btn-ghost btn-sm p-0 m-0"
              >
                <Cog6ToothIcon className="self-start size-5 stroke-2 text-neutral-500" />
              </button>
            </div>
            <div className="">
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

              {!config.datasetId && (
                <div className="alert alert-info mt-3 ">
                  <InformationCircleIcon className="h-6 w-6 stroke-2 " />

                  <span>Select a dataset to get started</span>
                </div>
              )}

              {config.datasetId && (!config.xAxis || !config.yAxis) && (
                <div className="alert alert-warning mt-3">
                  <ExclamationTriangleIcon className="h-6 w-6 stroke-2 " />

                  <span>Select both X-axis and Y-axis columns</span>
                </div>
              )}

              {needsGroupBy && (
                <div className="alert alert-warning mt-3">
                  <ExclamationTriangleIcon className="h-6 w-6 stroke-2 " />
                  <span>
                    {config.barMode === "grouped" ? "Grouped" : "Stacked"} mode
                    requires a "Group By" column
                  </span>
                </div>
              )}
            </div>
          </div>

          {settingsIsOpen && (
            <div className="basis-1/4 shrink">
              <div className="flex items-center py-1 ">
                <span className="font-semibold text-md text-neutral-500">
                  Chart Settings
                </span>
              </div>

              <div className="border-2 border-base-300 rounded-md bg-white">
                <div className="collapse collapse-open collapse-arrow border-b border-base-300 rounded-none pt-1">
                  <input type="checkbox" />
                  <h2 className="collapse-title font-semibold text-md py-1">
                    Dataset
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

                {config.datasetId && (
                  <div className="collapse collapse-arrow border-b border-base-300 rounded-none pt-1">
                    <input type="checkbox" />
                    <h2 className="collapse-title font-semibold text-md py-1">
                      Chart Axes
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
                {config.datasetId && config.xAxis && config.yAxis && (
                  <div className="collapse collapse-arrow  rounded-none pt-1">
                    <input type="checkbox" />
                    <h2 className="collapse-title font-semibold text-md py-1">
                      Chart Options
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
