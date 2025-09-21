import React, { useState, useMemo, useCallback, useRef } from "react"
import { TableRow } from "../types"
import "./VirtualizedTable.css"

interface VirtualizedTableProps {
  data: TableRow[]
  selectedRows: Set<string>
  onRowSelect: (id: string, selected: boolean) => void
  onSelectAll: (selected: boolean) => void
  sortColumn: keyof TableRow | null
  sortDirection: "asc" | "desc"
  onSort: (column: keyof TableRow) => void
}

const ROW_HEIGHT = 40
const CONTAINER_HEIGHT = 600

export const VirtualizedTable: React.FC<VirtualizedTableProps> = ({
  data,
  selectedRows,
  onRowSelect,
  onSelectAll,
  sortColumn,
  sortDirection,
  onSort,
}) => {
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const visibleStart = Math.floor(scrollTop / ROW_HEIGHT)
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(CONTAINER_HEIGHT / ROW_HEIGHT) + 1,
    data.length
  )

  const visibleRows = useMemo(() => {
    return data.slice(visibleStart, visibleEnd)
  }, [data, visibleStart, visibleEnd])

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  const isAllSelected = useMemo(() => {
    return data.length > 0 && data.every((row) => selectedRows.has(row.id))
  }, [data, selectedRows])

  const isIndeterminate = useMemo(() => {
    return selectedRows.size > 0 && !isAllSelected
  }, [selectedRows.size, isAllSelected])

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }, [])

  const formatScore = useCallback((score: number) => {
    return score.toFixed(1)
  }, [])

  return (
    <div className="virtualized-table-container">
      <div className="table-header">
        <div className="table-header-row">
          <div className="table-cell checkbox-cell">
            <input
              type="checkbox"
              checked={isAllSelected}
              ref={(input) => {
                if (input) input.indeterminate = isIndeterminate
              }}
              onChange={(e) => onSelectAll(e.target.checked)}
              aria-label="Select all rows"
            />
          </div>
          <div
            className="table-cell sortable"
            onClick={() => onSort("name")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && onSort("name")}
            aria-label={`Sort by name ${
              sortColumn === "name" ? sortDirection : ""
            }`}
          >
            Name{" "}
            {sortColumn === "name" && (sortDirection === "asc" ? "↑" : "↓")}
          </div>
          <div
            className="table-cell sortable"
            onClick={() => onSort("email")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && onSort("email")}
            aria-label={`Sort by email ${
              sortColumn === "email" ? sortDirection : ""
            }`}
          >
            Email{" "}
            {sortColumn === "email" && (sortDirection === "asc" ? "↑" : "↓")}
          </div>
          <div
            className="table-cell sortable"
            onClick={() => onSort("role")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && onSort("role")}
            aria-label={`Sort by role ${
              sortColumn === "role" ? sortDirection : ""
            }`}
          >
            Role{" "}
            {sortColumn === "role" && (sortDirection === "asc" ? "↑" : "↓")}
          </div>
          <div
            className="table-cell sortable"
            onClick={() => onSort("status")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && onSort("status")}
            aria-label={`Sort by status ${
              sortColumn === "status" ? sortDirection : ""
            }`}
          >
            Status{" "}
            {sortColumn === "status" && (sortDirection === "asc" ? "↑" : "↓")}
          </div>
          <div
            className="table-cell sortable"
            onClick={() => onSort("score")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && onSort("score")}
            aria-label={`Sort by score ${
              sortColumn === "score" ? sortDirection : ""
            }`}
          >
            Score{" "}
            {sortColumn === "score" && (sortDirection === "asc" ? "↑" : "↓")}
          </div>
          <div
            className="table-cell sortable"
            onClick={() => onSort("department")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && onSort("department")}
            aria-label={`Sort by department ${
              sortColumn === "department" ? sortDirection : ""
            }`}
          >
            Department{" "}
            {sortColumn === "department" &&
              (sortDirection === "asc" ? "↑" : "↓")}
          </div>
          <div
            className="table-cell sortable"
            onClick={() => onSort("joinDate")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && onSort("joinDate")}
            aria-label={`Sort by join date ${
              sortColumn === "joinDate" ? sortDirection : ""
            }`}
          >
            Join Date{" "}
            {sortColumn === "joinDate" && (sortDirection === "asc" ? "↑" : "↓")}
          </div>
        </div>
      </div>

      <div
        className="table-body"
        ref={containerRef}
        onScroll={handleScroll}
        style={{ height: CONTAINER_HEIGHT }}
        role="table"
        aria-label="Data table with virtualized rows"
      >
        <div
          className="table-spacer"
          style={{ height: visibleStart * ROW_HEIGHT }}
          aria-hidden="true"
        />

        {visibleRows.map((row, index) => {
          const actualIndex = visibleStart + index
          const isSelected = selectedRows.has(row.id)

          return (
            <div
              key={row.id}
              className={`table-row ${isSelected ? "selected" : ""}`}
              style={{ height: ROW_HEIGHT }}
              role="row"
              aria-selected={isSelected}
              aria-rowindex={actualIndex + 2} // +2 because header is row 1
            >
              <div className="table-cell checkbox-cell">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => onRowSelect(row.id, e.target.checked)}
                  aria-label={`Select row ${actualIndex + 1}`}
                />
              </div>
              <div className="table-cell" role="cell">
                {row.name}
              </div>
              <div className="table-cell" role="cell">
                {row.email}
              </div>
              <div className="table-cell" role="cell">
                <span className={`role-badge role-${row.role}`}>
                  {row.role}
                </span>
              </div>
              <div className="table-cell" role="cell">
                <span className={`status-badge status-${row.status}`}>
                  {row.status}
                </span>
              </div>
              <div className="table-cell" role="cell">
                {formatScore(row.score)}
              </div>
              <div className="table-cell" role="cell">
                {row.department}
              </div>
              <div className="table-cell" role="cell">
                {formatDate(row.joinDate)}
              </div>
            </div>
          )
        })}

        <div
          className="table-spacer"
          style={{ height: (data.length - visibleEnd) * ROW_HEIGHT }}
          aria-hidden="true"
        />
      </div>
    </div>
  )
}
