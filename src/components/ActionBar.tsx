import React, { useState } from "react"
import { Action } from "../types"
import "./ActionBar.css"

interface ActionBarProps {
  selectedCount: number
  totalCount: number
  onSelectAll: () => void
  onSelectNone: () => void
  actions: Action[]
}

export const ActionBar: React.FC<ActionBarProps> = ({
  selectedCount,
  totalCount,
  onSelectAll,
  onSelectNone,
  actions,
}) => {
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false)

  if (selectedCount === 0) {
    return null
  }

  const handleActionClick = (action: Action) => {
    // This would be handled by the parent component
    setIsActionMenuOpen(false)
  }

  return (
    <div className="action-bar" role="toolbar" aria-label="Bulk actions">
      <div className="action-bar-content">
        <div className="selection-info">
          <span className="selection-count">
            {selectedCount} of {totalCount} selected
          </span>
          <div className="selection-actions">
            <button
              className="selection-btn"
              onClick={onSelectAll}
              aria-label="Select all rows"
            >
              Select All
            </button>
            <button
              className="selection-btn"
              onClick={onSelectNone}
              aria-label="Clear selection"
            >
              Clear Selection
            </button>
          </div>
        </div>

        <div className="bulk-actions">
          <div className="action-menu">
            <button
              className="action-menu-toggle"
              onClick={() => setIsActionMenuOpen(!isActionMenuOpen)}
              aria-expanded={isActionMenuOpen}
              aria-haspopup="true"
              aria-label="Open action menu"
            >
              Actions
              <span className="action-menu-icon">▼</span>
            </button>

            {isActionMenuOpen && (
              <div className="action-menu-dropdown" role="menu">
                {actions.map((action) => (
                  <button
                    key={action.id}
                    className="action-menu-item"
                    onClick={() => handleActionClick(action)}
                    role="menuitem"
                  >
                    <span className="action-icon">{action.icon}</span>
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="quick-actions">
            {actions.slice(0, 3).map((action) => (
              <button
                key={action.id}
                className="quick-action-btn"
                onClick={() => handleActionClick(action)}
                aria-label={action.label}
                title={action.label}
              >
                <span className="action-icon">{action.icon}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {isActionMenuOpen && (
        <div
          className="action-menu-overlay"
          onClick={() => setIsActionMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  )
}
