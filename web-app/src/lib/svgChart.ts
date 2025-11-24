'use client';

export interface ChartDimensions {
  width: number;
  height: number;
  padding: number;
}

export const DEFAULT_CHART_DIMENSIONS: ChartDimensions = {
  width: 320,
  height: 160,
  padding: 16,
};

type Accessor<T> = ((item: T, index: number) => number) | keyof T;

function toNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

function resolveAccessor<T>(item: T, index: number, accessor: Accessor<T>): number {
  if (typeof accessor === 'function') {
    return toNumber(accessor(item, index));
  }
  return toNumber((item as Record<string, unknown>)[accessor as string]);
}

export function buildPolylinePoints<T>(
  data: T[],
  accessor: Accessor<T>,
  dims: ChartDimensions = DEFAULT_CHART_DIMENSIONS
): string {
  if (!data || data.length === 0) return '';

  const values = data.map((item, idx) => resolveAccessor(item, idx, accessor));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const usableWidth = dims.width - dims.padding * 2;
  const usableHeight = dims.height - dims.padding * 2;

  return values
    .map((value, idx) => {
      const x =
        dims.padding +
        (data.length === 1 ? usableWidth / 2 : (idx / (data.length - 1)) * usableWidth);
      const y = dims.padding + usableHeight - ((value - min) / range) * usableHeight;
      return `${x},${y}`;
    })
    .join(' ');
}

export function buildBandPolygon<T>(
  data: T[],
  upperAccessor: Accessor<T>,
  lowerAccessor: Accessor<T>,
  dims: ChartDimensions = DEFAULT_CHART_DIMENSIONS
): string {
  if (!data || data.length === 0) return '';

  const upperValues = data.map((item, idx) => resolveAccessor(item, idx, upperAccessor));
  const lowerValues = data.map((item, idx) => resolveAccessor(item, idx, lowerAccessor));
  const combined = [...upperValues, ...lowerValues];
  const min = Math.min(...combined);
  const max = Math.max(...combined);
  const range = max - min || 1;
  const usableWidth = dims.width - dims.padding * 2;
  const usableHeight = dims.height - dims.padding * 2;

  const upperPoints = upperValues.map((value, idx) => {
    const x =
      dims.padding +
      (data.length === 1 ? usableWidth / 2 : (idx / (data.length - 1)) * usableWidth);
    const y = dims.padding + usableHeight - ((value - min) / range) * usableHeight;
    return `${x},${y}`;
  });

  const lowerPoints = lowerValues
    .map((value, idx) => {
      const x =
        dims.padding +
        (data.length === 1 ? usableWidth / 2 : (idx / (data.length - 1)) * usableWidth);
      const y = dims.padding + usableHeight - ((value - min) / range) * usableHeight;
      return `${x},${y}`;
    })
    .reverse();

  return [...upperPoints, ...lowerPoints].join(' ');
}

export function hasUsableData<T>(data: T[] | null | undefined): data is T[] {
  return Array.isArray(data) && data.length > 0;
}

