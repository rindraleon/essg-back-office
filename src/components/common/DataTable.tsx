import React, { useMemo } from 'react';
import { Inbox } from 'lucide-react';
import { Button } from '../ui/button';

export interface Column<T> {
  id: string;
  label: string;
  minWidth?: number;
  align?: 'left' | 'center' | 'right';
  render: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  totalCount: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
  emptyMessage?: string;
  getRowId?: (row: T, index: number) => string | number;
}

const ROWS_PER_PAGE_OPTIONS = [5, 10, 25];

function DataTableInner<T>({
  columns,
  data,
  totalCount,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  emptyMessage = 'Aucune donnée trouvée',
  getRowId,
}: Readonly<DataTableProps<T>>) {
  const rowKey = useMemo(() => {
    if (!getRowId) return undefined;
    return new Map(data.map((row, index) => [row, getRowId(row, index)]));
  }, [data, getRowId]);

  const getRowKey = (row: T, index: number): string | number =>
    rowKey ? (rowKey.get(row) ?? index) : index;

  const actionColumn = columns.find((col) => col.id === 'actions') ?? null;

  const infoColumns = columns.filter((col) => col.id !== 'actions');

  const firstColumnSmall = (columns[0]?.minWidth ?? 0) < 120;
  const headerColumns = infoColumns.slice(0, firstColumnSmall ? 2 : 1);
  const bodyColumns = infoColumns.slice(headerColumns.length);

  const renderEmpty = () => (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-ink-400">
      <Inbox className="size-12" />
      <p className="text-base">{emptyMessage}</p>
    </div>
  );

  return (
    <div className="min-w-0 space-y-3">
      <div className="hidden max-w-full overflow-hidden rounded-xl border border-ink-100 bg-white shadow-card lg:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.id}
                    align={column.align || 'left'}
                    style={{ minWidth: column.minWidth }}
                    className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-ink-500 bg-ink-50 border-b border-ink-100"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length}>{renderEmpty()}</td>
                </tr>
              ) : (
                data.map((row, index) => (
                  <tr
                    key={getRowKey(row, index)}
                    className="border-b border-ink-100 last:border-0 transition-colors hover:bg-brand-50/60"
                  >
                    {columns.map((column) => (
                      <td key={column.id} align={column.align || 'left'} className="px-4 py-3.5">
                        {column.render(row)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-3 lg:hidden">
        {data.length === 0 ? (
          <div className="rounded-xl border border-ink-100 bg-white shadow-card">
            {renderEmpty()}
          </div>
        ) : (
          data.map((row, index) => (
            <article
              key={getRowKey(row, index)}
              className="overflow-hidden rounded-xl border border-ink-100 bg-white shadow-card transition-all duration-200 hover:border-brand-200 hover:shadow-card-hover"
            >
              <div className="flex items-start gap-3 px-4 pt-4">
                {headerColumns.map((column) => (
                  <div key={column.id} className="min-w-0 flex-1">
                    {column.render(row)}
                  </div>
                ))}
              </div>

              {bodyColumns.length > 0 && (
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 px-4 pt-4">
                  {bodyColumns.map((column) => (
                    <div key={column.id} className="min-w-0">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-ink-400">
                        {column.label}
                      </div>
                      <div className="mt-0.5 text-sm break-words text-ink-700">
                        {column.render(row)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {actionColumn && (
                <div className="mt-3 flex items-center justify-end gap-1 border-t border-ink-100 bg-ink-50/60 px-4 py-2.5">
                  {actionColumn.render(row)}
                </div>
              )}
            </article>
          ))
        )}
      </div>

      {totalCount > 0 && (
        <div className="flex flex-col gap-3 rounded-xl border border-ink-100 bg-white px-4 py-3 shadow-card sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-ink-500">
              {page * rowsPerPage + 1}–{Math.min((page + 1) * rowsPerPage, totalCount)} sur{' '}
              {totalCount}
            </span>

            <label className="flex items-center gap-2 text-xs text-ink-500">
              Lignes
              <select
                value={rowsPerPage}
                onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
                className="h-8 rounded-lg border border-ink-200 bg-white px-2 text-xs font-medium text-ink-700 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              >
                {ROWS_PER_PAGE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 0}
            >
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={(page + 1) * rowsPerPage >= totalCount}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

const DataTable = React.memo(DataTableInner) as {
  <T>(
    props: DataTableProps<T> & { getRowId?: (row: T, index: number) => string | number }
  ): React.ReactElement;
  displayName: string;
};

(DataTable as React.FC<{ displayName?: string }>).displayName = 'DataTable';

export default DataTable;
