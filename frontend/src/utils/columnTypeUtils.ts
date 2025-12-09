// Utility functions for working with dataset columns and types

export type ColumnType = 'numeric' | 'datetime' | 'categorical' | 'text';

export interface ColumnInfo {
  name: string;
  type: ColumnType;
}

/**
 * Filter columns by type
 */
export const getColumnsByType = (
  columns: string[],
  columnTypes: Record<string, ColumnType>,
  type: ColumnType
): string[] => {
  return columns.filter((col) => columnTypes[col] === type);
};

/**
 * Get numeric columns (good for Y-axis in bar charts)
 */
export const getNumericColumns = (
  columns: string[],
  columnTypes: Record<string, ColumnType>
): string[] => {
  return getColumnsByType(columns, columnTypes, 'numeric');
};

/**
 * Get categorical columns (good for X-axis in bar charts)
 */
export const getCategoricalColumns = (
  columns: string[],
  columnTypes: Record<string, ColumnType>
): string[] => {
  return getColumnsByType(columns, columnTypes, 'categorical');
};

/**
 * Get datetime columns
 */
export const getDateTimeColumns = (
  columns: string[],
  columnTypes: Record<string, ColumnType>
): string[] => {
  return getColumnsByType(columns, columnTypes, 'datetime');
};

/**
 * Get all columns with their types
 */
export const getColumnsWithTypes = (
  columns: string[],
  columnTypes: Record<string, ColumnType>
): ColumnInfo[] => {
  return columns.map((name) => ({
    name,
    type: columnTypes[name] || 'text',
  }));
};

/**
 * Check if a column can be used for X-axis (categorical, datetime, or text with few unique values)
 */
export const isValidXAxis = (
  columnType: ColumnType,
  uniqueValueCount?: number
): boolean => {
  if (columnType === 'categorical' || columnType === 'datetime') {
    return true;
  }
  // Text columns can be used if they have relatively few unique values
  if (columnType === 'text' && uniqueValueCount) {
    return uniqueValueCount < 50;
  }
  return false;
};

/**
 * Check if a column can be used for Y-axis (numeric)
 */
export const isValidYAxis = (columnType: ColumnType): boolean => {
  return columnType === 'numeric';
};

/**
 * Get unique values from a column
 */
export const getUniqueValues = (
  rows: Record<string, any>[],
  columnName: string
): any[] => {
  const uniqueSet = new Set(rows.map((row) => row[columnName]));
  return Array.from(uniqueSet);
};

/**
 * Get suggested X and Y axes based on column types
 */
export const getSuggestedAxes = (
  columns: string[],
  columnTypes: Record<string, ColumnType>
): { xAxis: string | null; yAxis: string | null } => {
  const categoricalCols = getCategoricalColumns(columns, columnTypes);
  const numericCols = getNumericColumns(columns, columnTypes);
  const datetimeCols = getDateTimeColumns(columns, columnTypes);

  // Prefer categorical for X-axis, fallback to datetime
  const xAxis =
    categoricalCols[0] || datetimeCols[0] || columns.find((col) => columnTypes[col] === 'text');

  // Use first numeric column for Y-axis
  const yAxis = numericCols[0] || null;

  return { xAxis, yAxis };
};

/**
 * Transform data for Recharts bar chart
 */
export const transformDataForBarChart = (
  rows: Record<string, any>[],
  xAxisColumn: string,
  yAxisColumn: string,
  groupByColumn?: string
): any[] => {
  if (!groupByColumn) {
    // Simple bar chart - just X and Y
    return rows.map((row) => ({
      name: row[xAxisColumn],
      value: Number(row[yAxisColumn]) || 0,
    }));
  }

  // Grouped bar chart
  const grouped = new Map<string, Record<string, number>>();

  rows.forEach((row) => {
    const xValue = String(row[xAxisColumn]);
    const groupValue = String(row[groupByColumn]);
    const yValue = Number(row[yAxisColumn]) || 0;

    if (!grouped.has(xValue)) {
      grouped.set(xValue, {});
    }

    const group = grouped.get(xValue)!;
    group[groupValue] = (group[groupValue] || 0) + yValue;
  });

  // Convert to array format for Recharts
  return Array.from(grouped.entries()).map(([xValue, groups]) => ({
    name: xValue,
    ...groups,
  }));
};

/**
 * Get all unique group values (for grouped bar charts)
 */
export const getGroupValues = (
  rows: Record<string, any>[],
  groupByColumn: string
): string[] => {
  const uniqueGroups = new Set(rows.map((row) => String(row[groupByColumn])));
  return Array.from(uniqueGroups);
};