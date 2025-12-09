import { BarChartMode, ChartData } from './chart.types';

/**
 * Transform raw dataset rows into chart-ready format
 */
export const transformDataForChart = (
  rows: Record<string, any>[],
  xAxis: string,
  yAxis: string,
  barMode: BarChartMode,
  groupBy: string | null,
  sortBy: 'none' | 'ascending' | 'descending' = 'none',
  limit: number | null = null
): { data: ChartData[]; dataKeys: string[] } => {
  if (barMode === 'simple' || !groupBy) {
    return transformSimpleBarData(rows, xAxis, yAxis, sortBy, limit);
  }
  
  return transformGroupedBarData(rows, xAxis, yAxis, groupBy, sortBy, limit);
};

/**
 * Simple bar chart - just X and Y
 */
const transformSimpleBarData = (
  rows: Record<string, any>[],
  xAxis: string,
  yAxis: string,
  sortBy: 'none' | 'ascending' | 'descending',
  limit: number | null
): { data: ChartData[]; dataKeys: string[] } => {
  // Aggregate by X-axis (sum all Y values for each X value)
  const aggregated = new Map<string, number>();
  
  rows.forEach((row) => {
    const xValue = String(row[xAxis] ?? 'Unknown');
    const yValue = Number(row[yAxis]) || 0;
    
    aggregated.set(xValue, (aggregated.get(xValue) || 0) + yValue);
  });
  
  // Convert to array
  let data: ChartData[] = Array.from(aggregated.entries()).map(([name, value]) => ({
    name,
    value,
  }));
  
  // Sort
  data = sortChartData(data, 'value', sortBy);
  
  // Limit
  if (limit && limit > 0) {
    data = data.slice(0, limit);
  }
  
  return {
    data,
    dataKeys: ['value'],
  };
};

/**
 * Grouped/Stacked bar chart - X, Y, and Group By
 */
const transformGroupedBarData = (
  rows: Record<string, any>[],
  xAxis: string,
  yAxis: string,
  groupBy: string,
  sortBy: 'none' | 'ascending' | 'descending',
  limit: number | null
): { data: ChartData[]; dataKeys: string[] } => {
  // Group data: { xValue: { groupValue: sum } }
  const grouped = new Map<string, Map<string, number>>();
  const groupKeys = new Set<string>();
  
  rows.forEach((row) => {
    const xValue = String(row[xAxis] ?? 'Unknown');
    const groupValue = String(row[groupBy] ?? 'Unknown');
    const yValue = Number(row[yAxis]) || 0;
    
    if (!grouped.has(xValue)) {
      grouped.set(xValue, new Map());
    }
    
    const xGroup = grouped.get(xValue)!;
    xGroup.set(groupValue, (xGroup.get(groupValue) || 0) + yValue);
    groupKeys.add(groupValue);
  });
  
  // Convert to array format for Recharts
  let data: ChartData[] = Array.from(grouped.entries()).map(([name, groups]) => {
    const item: ChartData = { name };
    
    // Add all group values
    groups.forEach((value, groupName) => {
      item[groupName] = value;
    });
    
    // Fill missing groups with 0
    groupKeys.forEach((key) => {
      if (!(key in item)) {
        item[key] = 0;
      }
    });
    
    return item;
  });
  
  // Sort by total value across all groups
  if (sortBy !== 'none') {
    data = data.sort((a, b) => {
      const aTotal = Array.from(groupKeys).reduce(
        (sum, key) => sum + (Number(a[key]) || 0),
        0
      );
      const bTotal = Array.from(groupKeys).reduce(
        (sum, key) => sum + (Number(b[key]) || 0),
        0
      );
      
      return sortBy === 'ascending' ? aTotal - bTotal : bTotal - aTotal;
    });
  }
  
  // Limit
  if (limit && limit > 0) {
    data = data.slice(0, limit);
  }
  
  return {
    data,
    dataKeys: Array.from(groupKeys),
  };
};

/**
 * Sort chart data
 */
const sortChartData = (
  data: ChartData[],
  valueKey: string,
  sortBy: 'none' | 'ascending' | 'descending'
): ChartData[] => {
  if (sortBy === 'none') return data;
  
  return [...data].sort((a, b) => {
    const aVal = Number(a[valueKey]) || 0;
    const bVal = Number(b[valueKey]) || 0;
    
    return sortBy === 'ascending' ? aVal - bVal : bVal - aVal;
  });
};

/**
 * Get summary statistics for a numeric column
 */
export const getColumnStats = (
  rows: Record<string, any>[],
  columnName: string
): {
  min: number;
  max: number;
  mean: number;
  sum: number;
  count: number;
} => {
  const values = rows
    .map((row) => Number(row[columnName]))
    .filter((val) => !isNaN(val) && val !== null);
  
  if (values.length === 0) {
    return { min: 0, max: 0, mean: 0, sum: 0, count: 0 };
  }
  
  const sum = values.reduce((acc, val) => acc + val, 0);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const mean = sum / values.length;
  
  return { min, max, mean, sum, count: values.length };
};

/**
 * Format large numbers for display
 */
export const formatNumber = (num: number): string => {
  if (Math.abs(num) >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1) + 'B';
  }
  if (Math.abs(num) >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + 'M';
  }
  if (Math.abs(num) >= 1_000) {
    return (num / 1_000).toFixed(1) + 'K';
  }
  return num.toFixed(0);
};