import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatNumber } from "../../utils/chart.data.utils";
import { BarChartMode, ChartData } from "../../utils/chart.types";

interface BarChartVisualizationProps {
  data: ChartData[];
  dataKeys: string[];
  barMode: BarChartMode;
  xAxisLabel?: string;
  yAxisLabel?: string;
  colors: string[];
  showLegend: boolean;
  showGrid: boolean;
}

export const BarChartVisualization = ({
  data,
  dataKeys,
  barMode,
  xAxisLabel,
  yAxisLabel,
  colors,
  showLegend,
  showGrid,
}: BarChartVisualizationProps) => {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-base-200 rounded-lg">
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">No data to display</p>
          <p className="text-sm opacity-70">
            Configure your chart settings to see the visualization
          </p>
        </div>
      </div>
    );
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-base-100 border border-base-300 rounded-lg p-3 shadow-lg">
          <p className="font-semibold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}:{" "}
              <span className="font-bold">{formatNumber(entry.value)}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-96 bg-base-100 rounded-lg p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" opacity={0.3} />}

          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={80}
            label={{
              value: xAxisLabel || "Category",
              position: "insideBottom",
              offset: -50,
            }}
          />

          <YAxis
            tickFormatter={formatNumber}
            label={{
              value: yAxisLabel || "Value",
              angle: -90,
              position: "insideLeft",
            }}
          />

          <Tooltip content={<CustomTooltip />} />

          {showLegend && <Legend />}

          {/* Render bars based on mode */}
          {barMode === "simple" ? (
            // Simple mode - single bar with gradient colors
            <Bar dataKey={dataKeys[0]} radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Bar>
          ) : (
            // Grouped or Stacked mode - multiple bars
            dataKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={colors[index % colors.length]}
                stackId={barMode === "stacked" ? "stack" : undefined}
                radius={
                  barMode === "stacked" && index === dataKeys.length - 1
                    ? [8, 8, 0, 0]
                    : 0
                }
              />
            ))
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
