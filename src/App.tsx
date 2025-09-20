import React, { useState, useEffect, useMemo } from "react"
import { generateTableData } from "./dataGenerator"
import { useTableData } from "./hooks/useTableData"
import { VirtualizedTable } from "./components/VirtualizedTable"
import { FilterPanel } from "./components/FilterPanel"
import { ActionBar } from "./components/ActionBar"
import { Action } from "./types"
import "./App.css"

function App() {
  const [data] = useState(() => generateTableData(100000))
  const [isLoading, setIsLoading] = useState(true)
  const [notifications, setNotifications] = useState<
    Array<{ id: string; message: string; type: "success" | "error" | "info" }>
  >([])

  const {
    filteredData,
    selectedRows,
    filters,
    sortColumn,
    sortDirection,
    updateFilters,
    clearAllFilters,
    setSorting,
    toggleRowSelection,
    selectAllRows,
    getActiveFilters,
    removeFilter,
  } = useTableData(data)

  // Simulate loading time for large dataset
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  const addNotification = (
    message: string,
    type: "success" | "error" | "info" = "info"
  ) => {
    const id = Date.now().toString()
    setNotifications((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    }, 3000)
  }

  const actions: Action[] = useMemo(
    () => [
      {
        id: "export",
        label: "Export Selected",
        icon: "📤",
        handler: (selectedIds: string[]) => {
          addNotification(
            `Exported ${selectedIds.length} rows to CSV`,
            "success"
          )
        },
      },
      {
        id: "delete",
        label: "Delete Selected",
        icon: "🗑️",
        handler: (selectedIds: string[]) => {
          addNotification(`Deleted ${selectedIds.length} rows`, "success")
        },
      },
      {
        id: "activate",
        label: "Activate Selected",
        icon: "✅",
        handler: (selectedIds: string[]) => {
          addNotification(`Activated ${selectedIds.length} users`, "success")
        },
      },
      {
        id: "deactivate",
        label: "Deactivate Selected",
        icon: "❌",
        handler: (selectedIds: string[]) => {
          addNotification(`Deactivated ${selectedIds.length} users`, "success")
        },
      },
      {
        id: "send-email",
        label: "Send Email",
        icon: "📧",
        handler: (selectedIds: string[]) => {
          addNotification(
            `Sent email to ${selectedIds.length} users`,
            "success"
          )
        },
      },
      {
        id: "assign-role",
        label: "Assign Role",
        icon: "👤",
        handler: (selectedIds: string[]) => {
          addNotification(
            `Assigned role to ${selectedIds.length} users`,
            "success"
          )
        },
      },
    ],
    []
  )

  const handleSelectAll = () => {
    selectAllRows(true)
  }

  const handleSelectNone = () => {
    selectAllRows(false)
  }

  const activeFilters = getActiveFilters()

  if (isLoading) {
    return (
      <div className="app">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <h2>Loading 100,000 rows...</h2>
          <p>Generating realistic sample data</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>High-Performance Data Table</h1>
        <p>Virtualized table with filtering, sorting, and bulk actions</p>
        <div className="stats">
          <div className="stat">
            <span className="stat-label">Total Rows:</span>
            <span className="stat-value">{data.length.toLocaleString()}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Filtered Rows:</span>
            <span className="stat-value">
              {filteredData.length.toLocaleString()}
            </span>
          </div>
          <div className="stat">
            <span className="stat-label">Selected:</span>
            <span className="stat-value">
              {selectedRows.size.toLocaleString()}
            </span>
          </div>
        </div>
      </header>

      <main className="app-main">
        <FilterPanel
          filters={filters}
          onFiltersChange={updateFilters}
          onClearAll={clearAllFilters}
          activeFilters={activeFilters}
          onRemoveFilter={removeFilter}
        />

        <div className="table-container">
          <ActionBar
            selectedCount={selectedRows.size}
            totalCount={filteredData.length}
            onSelectAll={handleSelectAll}
            onSelectNone={handleSelectNone}
            actions={actions}
            selectedRowIds={Array.from(selectedRows)}
          />

          <VirtualizedTable
            data={filteredData}
            selectedRows={selectedRows}
            onRowSelect={toggleRowSelection}
            onSelectAll={selectAllRows}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={setSorting}
          />
        </div>
      </main>

      {notifications.length > 0 && (
        <div className="notifications">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification notification-${notification.type}`}
              role="alert"
              aria-live="polite"
            >
              <span className="notification-message">
                {notification.message}
              </span>
              <button
                className="notification-close"
                onClick={() =>
                  setNotifications((prev) =>
                    prev.filter((n) => n.id !== notification.id)
                  )
                }
                aria-label="Close notification"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default App
