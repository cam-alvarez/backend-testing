// Types for chart configuration

export type ChartType = 'bar' | 'line' | 'area' | 'pie' | 'scatter';

export type BarChartMode = 'simple' | 'grouped' | 'stacked';

export interface ChartConfig {
  // Dataset selection
  datasetId: number | null;
  
  // Axis configuration
  xAxis: string | null;
  yAxis: string | null;
  
  // Bar chart specific
  barMode: BarChartMode;
  groupBy: string | null; // For grouped/stacked charts
  
  // Visual customization
  colors: string[];
  showLegend: boolean;
  showGrid: boolean;
  showTooltip: boolean;
  
  // Data options
  sortBy: 'none' | 'ascending' | 'descending';
  limit: number | null; // Limit number of bars shown
}

export const DEFAULT_CHART_CONFIG: ChartConfig = {
  datasetId: null,
  xAxis: null,
  yAxis: null,
  barMode: 'simple',
  groupBy: null,
  colors: [
    '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1',
    '#d084d0', '#ffb84d', '#a4de6c', '#ff8042', '#00C49F'
  ],
  showLegend: true,
  showGrid: true,
  showTooltip: true,
  sortBy: 'none',
  limit: null,
};

export interface ChartData {
  name: string;
  [key: string]: string | number;
}