import React, { useMemo, useState, useRef } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  createColumnHelper,
  flexRender,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"
import { TableRow } from "../types"
import "./ReactTable.css"

interface ReactTableProps {
  data: TableRow[]
  selectedRows: Set<string>
  onRowSelect: (id: string, selected: boolean) => void
  onSelectAll: (selected: boolean) => void
  sortColumn: keyof TableRow | null
  sortDirection: "asc" | "desc"
  onSort: (column: keyof TableRow) => void
}

const columnHelper = createColumnHelper<TableRow>()

const ROW_HEIGHT = 40
const CONTAINER_HEIGHT = 600

export const ReactTable: React.FC<ReactTableProps> = ({
  data,
  selectedRows,
  onRowSelect,
  onSelectAll,
  sortColumn,
  sortDirection,
  onSort,
}) => {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const tableContainerRef = useRef<HTMLDivElement>(null)

  // Define columns
  const columns = useMemo(
    () => [
      // Selection column
      columnHelper.display({
        id: "select",
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllRowsSelected()}
            ref={(input) => {
              if (input) input.indeterminate = table.getIsSomeRowsSelected()
            }}
            onChange={(e) => onSelectAll(e.target.checked)}
            aria-label="Select all rows"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={selectedRows.has(row.original.id)}
            onChange={(e) => onRowSelect(row.original.id, e.target.checked)}
            aria-label={`Select row ${row.index + 1}`}
          />
        ),
        size: 50,
        enableSorting: false,
      }),

      // Name column
      columnHelper.accessor("name", {
        header: "Name",
        cell: (info) => info.getValue(),
        size: 200,
      }),

      // Email column
      columnHelper.accessor("email", {
        header: "Email",
        cell: (info) => info.getValue(),
        size: 250,
      }),

      // Role column
      columnHelper.accessor("role", {
        header: "Role",
        cell: (info) => (
          <span className={`role-badge role-${info.getValue()}`}>
            {info.getValue()}
          </span>
        ),
        size: 100,
      }),

      // Status column
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => (
          <span className={`status-badge status-${info.getValue()}`}>
            {info.getValue()}
          </span>
        ),
        size: 100,
      }),

      // Score column
      columnHelper.accessor("score", {
        header: "Score",
        cell: (info) => info.getValue().toFixed(1),
        size: 80,
      }),

      // Department column
      columnHelper.accessor("department", {
        header: "Department",
        cell: (info) => info.getValue(),
        size: 120,
      }),

      // Join Date column
      columnHelper.accessor("joinDate", {
        header: "Join Date",
        cell: (info) => new Date(info.getValue()).toLocaleDateString(),
        size: 100,
      }),
    ],
    [selectedRows, onRowSelect, onSelectAll]
  )

  // Create table instance
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableRowSelection: true,
    getRowId: (row) => row.id,
  })

  // Create virtualizer for performance
  const { rows } = table.getRowModel()
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  })

  return (
    <div className="react-table-container">
      <div className="react-table-wrapper">
        <table className="react-table">
          <thead className="react-table-header">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={`react-table-header-cell ${
                      header.column.getCanSort() ? "sortable" : ""
                    }`}
                    style={{ width: header.getSize() }}
                    onClick={header.column.getToggleSortingHandler()}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        header.column.getToggleSortingHandler()?.(e)
                      }
                    }}
                    aria-label={`Sort by ${header.column.columnDef.header}`}
                  >
                    <div className="header-content">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      {header.column.getIsSorted() === "asc" && " ↑"}
                      {header.column.getIsSorted() === "desc" && " ↓"}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
        </table>

        {/* Virtualized table body */}
        <div
          ref={tableContainerRef}
          className="react-table-body-container"
          style={{
            height: CONTAINER_HEIGHT,
            overflow: "auto",
          }}
        >
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = rows[virtualRow.index]
              return (
                <div
                  key={row.id}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <table className="react-table" style={{ width: "100%" }}>
                    <tbody>
                      <tr
                        className={`react-table-row ${
                          selectedRows.has(row.original.id) ? "selected" : ""
                        }`}
                        role="row"
                        aria-selected={selectedRows.has(row.original.id)}
                        aria-rowindex={virtualRow.index + 2}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className="react-table-cell"
                            style={{ width: cell.column.getSize() }}
                            role="cell"
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
