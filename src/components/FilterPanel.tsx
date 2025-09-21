import React, { useState, useCallback } from "react"
import { FilterState } from "../types"
import "./FilterPanel.css"

interface FilterPanelProps {
  filters: FilterState
  onFiltersChange: (filters: Partial<FilterState>) => void
  onClearAll: () => void
  activeFilters: Array<{ key: string; label: string; value: any }>
  onRemoveFilter: (key: keyof FilterState) => void
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  onClearAll,
  activeFilters,
  onRemoveFilter,
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleTextFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onFiltersChange({ textFilter: e.target.value })
    },
    [onFiltersChange]
  )

  const handleRoleFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onFiltersChange({ roleFilter: e.target.value || "" })
    },
    [onFiltersChange]
  )

  const handleStatusFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onFiltersChange({ statusFilter: e.target.value || "" })
    },
    [onFiltersChange]
  )

  const handleScoreMinChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value ? parseInt(e.target.value, 10) : null
      onFiltersChange({ scoreMin: value })
    },
    [onFiltersChange]
  )

  const handleScoreMaxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value ? parseInt(e.target.value, 10) : null
      onFiltersChange({ scoreMax: value })
    },
    [onFiltersChange]
  )

  const hasActiveFilters = activeFilters.length > 0

  return (
    <div className="filter-panel">
      <div className="filter-header">
        <button
          className="filter-toggle"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          aria-controls="filter-content"
        >
          <span className="filter-icon">🔍</span>
          Filters
          {hasActiveFilters && (
            <span
              className="filter-count"
              aria-label={`${activeFilters.length} active filters`}
            >
              {activeFilters.length}
            </span>
          )}
          <span className={`expand-icon ${isExpanded ? "expanded" : ""}`}>
            ▼
          </span>
        </button>

        {hasActiveFilters && (
          <button
            className="clear-all-btn"
            onClick={onClearAll}
            aria-label="Clear all filters"
          >
            Clear All
          </button>
        )}
      </div>

      {isExpanded && (
        <div id="filter-content" className="filter-content">
          <div className="filter-section">
            <label htmlFor="text-filter" className="filter-label">
              Search
            </label>
            <input
              id="text-filter"
              type="text"
              placeholder="Search by name or email..."
              value={filters.textFilter}
              onChange={handleTextFilterChange}
              className="filter-input"
              aria-describedby="text-filter-help"
            />
            <div id="text-filter-help" className="filter-help">
              Searches across name and email fields
            </div>
          </div>

          <div className="filter-row">
            <div className="filter-section">
              <label htmlFor="role-filter" className="filter-label">
                Role
              </label>
              <select
                id="role-filter"
                value={filters.roleFilter}
                onChange={handleRoleFilterChange}
                className="filter-select"
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
                <option value="moderator">Moderator</option>
                <option value="guest">Guest</option>
              </select>
            </div>

            <div className="filter-section">
              <label htmlFor="status-filter" className="filter-label">
                Status
              </label>
              <select
                id="status-filter"
                value={filters.statusFilter}
                onChange={handleStatusFilterChange}
                className="filter-select"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div className="filter-section">
            <label className="filter-label">Score Range</label>
            <div className="score-range">
              <div className="score-input-group">
                <label htmlFor="score-min" className="score-label">
                  Min
                </label>
                <input
                  id="score-min"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0"
                  value={filters.scoreMin || ""}
                  onChange={handleScoreMinChange}
                  className="filter-input score-input"
                />
              </div>
              <span className="score-separator">to</span>
              <div className="score-input-group">
                <label htmlFor="score-max" className="score-label">
                  Max
                </label>
                <input
                  id="score-max"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="100"
                  value={filters.scoreMax || ""}
                  onChange={handleScoreMaxChange}
                  className="filter-input score-input"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {hasActiveFilters && (
        <div className="active-filters">
          <div className="active-filters-label">Active Filters:</div>
          <div className="filter-pills">
            {activeFilters.map((filter) => (
              <div key={filter.key} className="filter-pill">
                <span className="filter-pill-label">{filter.label}</span>
                <button
                  className="filter-pill-remove"
                  onClick={() =>
                    onRemoveFilter(filter.key as keyof FilterState)
                  }
                  aria-label={`Remove ${filter.label} filter`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
