import React, { useState, useEffect, useMemo } from "react"
import {
  dataGenerationService,
  DataSource,
  APIDataOptions,
  CSVDataOptions,
  SyntheticDataOptions,
} from "./services/DataGenerationService"
import { useTableData } from "./hooks/useTableData"
import { VirtualizedTable } from "./components/VirtualizedTable"
import { FilterPanel } from "./components/FilterPanel"
import { ActionBar } from "./components/ActionBar"
import { DataSourceSelector } from "./components/DataSourceSelector"
import { Action, TableRow } from "./types"
import "./App.css"

function ServiceWorkerApp() {
  const [data, setData] = useState<TableRow[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [selectedDataSource, setSelectedDataSource] =
    useState<DataSource>("synthetic")
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

  // Initialize service worker
  useEffect(() => {
    const initializeServiceWorker = async () => {
      try {
        await dataGenerationService.initialize()
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to initialize service worker"
        )
      }
    }

    initializeServiceWorker()

    // Cleanup on unmount
    return () => {
      dataGenerationService.cancelAllRequests()
    }
  }, [])

  // Load data based on selected source
  const handleLoadData = async (source: DataSource, options: any) => {
    let isCancelled = false

    try {
      setIsLoading(true)
      setError(null)
      setLoadingProgress(0)

      let generatedData: TableRow[] = []

      switch (source) {
        case "synthetic":
          const syntheticOptions: SyntheticDataOptions = {
            count: options.count,
            chunkSize: 2000,
            onProgress: (progress, processed, total) => {
              if (!isCancelled) {
                setLoadingProgress(progress)
              }
            },
          }
          generatedData = await dataGenerationService.generateSyntheticData(
            syntheticOptions
          )
          break

        case "api":
          const apiOptions: APIDataOptions = {
            endpoint: options.endpoint,
            method: options.method || "GET",
            headers: options.headers || {},
            body: options.body,
            userCount: options.userCount || 10,
            chunkSize: 1000,
            onProgress: (progress, processed, total) => {
              if (!isCancelled) {
                setLoadingProgress(progress)
              }
            },
          }
          generatedData = await dataGenerationService.fetchAPIData(apiOptions)
          break

        case "csv":
          const csvOptions: CSVDataOptions = {
            file: options.file,
            delimiter: options.delimiter || ",",
            hasHeader: options.hasHeader !== false,
            chunkSize: 1000,
            onProgress: (progress, processed, total) => {
              if (!isCancelled) {
                setLoadingProgress(progress)
              }
            },
          }
          generatedData = await dataGenerationService.parseCSVData(csvOptions)
          break
      }

      if (!isCancelled) {
        setData(generatedData)
        setIsLoading(false)
        addNotification(
          `Successfully loaded ${generatedData.length} rows from ${source}`,
          "success"
        )
      }
    } catch (error) {
      if (!isCancelled) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred"
        setError(errorMessage)
        setIsLoading(false)
        addNotification(`Failed to load data: ${errorMessage}`, "error")
      }
    }

    return () => {
      isCancelled = true
    }
  }

  const addNotification = (
    message: string,
    type: "success" | "error" | "info" = "info"
  ) => {
    const id = Date.now().toString()
    setNotifications((prev) => [...prev, { id, message, type }])

    const timeoutId = setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    }, 3000)

    // Store timeout for potential cleanup (though notifications auto-cleanup)
    return timeoutId
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

  if (error) {
    return (
      <div className="app">
        <div className="loading-container">
          <div className="error-icon">⚠️</div>
          <h2>Error Loading Data</h2>
          <p>{error}</p>
          <button
            className="retry-btn"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="app">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <h2>Loading 100,000 rows...</h2>
          <p>Generating data in background service worker</p>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${loadingProgress}%` }}
            ></div>
          </div>
          <p className="progress-text">
            {Math.round(loadingProgress)}% complete
          </p>
          <p className="service-worker-info">
            🚀 Using Service Worker for optimal performance
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🚀 High-Performance Virtualized Table</h1>
        <p>
          Multi-Source Data • Service Worker Optimized • Real-time Filtering
        </p>
        {data.length > 0 && (
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
        )}
      </header>

      <main className="app-main">
        <DataSourceSelector
          selectedSource={selectedDataSource}
          onSourceChange={setSelectedDataSource}
          onLoadData={handleLoadData}
          isLoading={isLoading}
        />

        {data.length > 0 && (
          <>
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

              {filteredData.length > 0 ? (
                <VirtualizedTable
                  data={filteredData}
                  selectedRows={selectedRows}
                  onRowSelect={toggleRowSelection}
                  onSelectAll={selectAllRows}
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                  onSort={setSorting}
                />
              ) : (
                <div className="no-data-message">
                  <p>No data matches your current filters</p>
                  <button
                    onClick={clearAllFilters}
                    className="clear-filters-btn"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {data.length === 0 && !isLoading && (
          <div className="welcome-message">
            <h3>Welcome to the High-Performance Data Table</h3>
            <p>Choose a data source above to get started:</p>
            <ul>
              <li>
                <strong>🎲 Synthetic Data:</strong> Generate test data with
                customizable row count
              </li>
              <li>
                <strong>🌐 API Data:</strong> Load data from any REST API
                endpoint
              </li>
              <li>
                <strong>📄 CSV Upload:</strong> Upload and parse CSV files with
                flexible formatting
              </li>
            </ul>
            <p>
              All data sources are processed in the background using Service
              Workers for optimal performance!
            </p>
          </div>
        )}
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

export default ServiceWorkerApp
