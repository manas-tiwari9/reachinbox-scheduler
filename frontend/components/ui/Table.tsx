import React from 'react';
import { LucideIcon } from 'lucide-react';

interface Column<T> {
  header: string;
  accessor: (item: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading: boolean;
  emptyIcon: LucideIcon;
  emptyMessage: string;
}

export function Table<T>({ columns, data, isLoading, emptyIcon: EmptyIcon, emptyMessage }: TableProps<T>) {
  if (isLoading) {
    return (
      <div className="w-full bg-[#1A1A1A] rounded-lg border border-[#2A2A2A] overflow-hidden">
        <div className="animate-pulse flex flex-col">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 border-b border-[#2A2A2A] flex items-center px-6">
              <div className="h-4 bg-[#2A2A2A] rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full bg-[#1A1A1A] rounded-lg border border-[#2A2A2A] py-16 flex flex-col items-center justify-center text-gray-400">
        <EmptyIcon className="w-12 h-12 mb-4 opacity-50" />
        <p className="text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#1A1A1A] rounded-lg border border-[#2A2A2A] overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[#2A2A2A] bg-[#222]">
            {columns.map((col, i) => (
              <th key={i} className="px-6 py-4 text-sm font-semibold text-gray-300 whitespace-nowrap">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#2A2A2A]">
          {data.map((item, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-[#222] transition-colors">
              {columns.map((col, colIndex) => (
                <td key={colIndex} className="px-6 py-4 text-sm whitespace-nowrap">
                  {col.accessor(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
