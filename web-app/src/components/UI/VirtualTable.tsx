'use client';

import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

interface VirtualTableProps {
  data: any[];
  rowHeight?: number;
  overscan?: number;
  renderRow: (item: any, index: number) => React.ReactNode;
  containerClassName?: string;
  tableClassName?: string;
}

export function VirtualTable({
  data,
  rowHeight = 60,
  overscan = 5,
  renderRow,
  containerClassName = '',
  tableClassName = '',
}: VirtualTableProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan,
  });

  return (
    <div
      ref={parentRef}
      className={`overflow-auto ${containerClassName}`}
      style={{ height: 'calc(100vh - 260px)', maxHeight: 'calc(100vh - 260px)' }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        <table className={`min-w-full text-sm ${tableClassName}`} style={{ tableLayout: 'fixed', width: '100%' }}>
          <tbody>
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const item = data[virtualRow.index];
              return (
                <tr
                  key={virtualRow.key}
                  data-index={virtualRow.index}
                  ref={virtualizer.measureElement}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  {renderRow(item, virtualRow.index)}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

