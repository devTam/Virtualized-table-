import { useState, useMemo, useCallback, useEffect } from "react"
import { TableRow, FilterState, TableState } from "../types"
import { useDebounce } from "./useDebounce"

export function useTableData(initialData: TableRow[]) {
  const [state, setState] = useState<TableState>({
    data: initialData,
    filteredData: initialData,
    selectedRows: new Set(),
    filters: {
      textFilter: "",
      roleFilter: "",
      statusFilter: "",
      scoreMin: null,
      scoreMax: null,
    },
    sortColumn: null,
    sortDirection: "asc",
  })

  const debouncedTextFilter = useDebounce(state.filters.textFilter, 300)

  // Update internal state when initialData changes
  useEffect(() => {
    setState((prev) => ({
      ...prev,
      data: initialData,
      // Don't set filteredData here - let useMemo handle it
    }))
  }, [initialData])

  const filteredData = useMemo(() => {
    // Use state.data as the source
    let filtered = state.data

    // Apply all filters in a single pass to reduce iterations
    if (
      debouncedTextFilter ||
      state.filters.roleFilter ||
      state.filters.statusFilter ||
      state.filters.scoreMin !== null ||
      state.filters.scoreMax !== null
    ) {
      const searchTerm = debouncedTextFilter?.toLowerCase()

      filtered = filtered.filter((row) => {
        // Text filter
        if (
          searchTerm &&
          !row.name.toLowerCase().includes(searchTerm) &&
          !row.email.toLowerCase().includes(searchTerm)
        ) {
          return false
        }

        // Role filter
        if (state.filters.roleFilter && row.role !== state.filters.roleFilter) {
          return false
        }

        // Status filter
        if (
          state.filters.statusFilter &&
          row.status !== state.filters.statusFilter
        ) {
          return false
        }

        // Score range filter
        if (
          state.filters.scoreMin !== null &&
          row.score < state.filters.scoreMin!
        ) {
          return false
        }
        if (
          state.filters.scoreMax !== null &&
          row.score > state.filters.scoreMax!
        ) {
          return false
        }

        return true
      })
    }

    // Apply sorting
    if (state.sortColumn) {
      filtered.sort((a, b) => {
        const aVal = a[state.sortColumn!]
        const bVal = b[state.sortColumn!]

        let comparison = 0
        if (aVal < bVal) comparison = -1
        else if (aVal > bVal) comparison = 1

        return state.sortDirection === "asc" ? comparison : -comparison
      })
    }

    return filtered
  }, [
    state.data,
    debouncedTextFilter,
    state.filters.roleFilter,
    state.filters.statusFilter,
    state.filters.scoreMin,
    state.filters.scoreMax,
    state.sortColumn,
    state.sortDirection,
  ])

  const updateFilters = useCallback((newFilters: Partial<FilterState>) => {
    setState((prev) => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters },
      selectedRows: new Set(), // Clear selection when filters change
    }))
  }, [])

  const clearAllFilters = useCallback(() => {
    setState((prev) => ({
      ...prev,
      filters: {
        textFilter: "",
        roleFilter: "",
        statusFilter: "",
        scoreMin: null,
        scoreMax: null,
      },
      selectedRows: new Set(),
    }))
  }, [])

  const setSorting = useCallback((column: keyof TableRow) => {
    setState((prev) => ({
      ...prev,
      sortColumn: column,
      sortDirection:
        prev.sortColumn === column && prev.sortDirection === "asc"
          ? "desc"
          : "asc",
    }))
  }, [])

  const toggleRowSelection = useCallback((id: string, selected: boolean) => {
    setState((prev) => {
      const newSelected = new Set(prev.selectedRows)
      if (selected) {
        newSelected.add(id)
      } else {
        newSelected.delete(id)
      }
      return { ...prev, selectedRows: newSelected }
    })
  }, [])

  const selectAllRows = useCallback(
    (selected: boolean) => {
      setState((prev) => ({
        ...prev,
        selectedRows: selected
          ? new Set(filteredData.map((row) => row.id))
          : new Set(),
      }))
    },
    [filteredData]
  )

  const getActiveFilters = useCallback(() => {
    const active = []
    if (state.filters.textFilter) {
      active.push({
        key: "textFilter",
        label: `Text: "${state.filters.textFilter}"`,
        value: state.filters.textFilter,
      })
    }
    if (state.filters.roleFilter) {
      active.push({
        key: "roleFilter",
        label: `Role: ${state.filters.roleFilter}`,
        value: state.filters.roleFilter,
      })
    }
    if (state.filters.statusFilter) {
      active.push({
        key: "statusFilter",
        label: `Status: ${state.filters.statusFilter}`,
        value: state.filters.statusFilter,
      })
    }
    if (state.filters.scoreMin !== null) {
      active.push({
        key: "scoreMin",
        label: `Score ≥ ${state.filters.scoreMin}`,
        value: state.filters.scoreMin,
      })
    }
    if (state.filters.scoreMax !== null) {
      active.push({
        key: "scoreMax",
        label: `Score ≤ ${state.filters.scoreMax}`,
        value: state.filters.scoreMax,
      })
    }
    return active
  }, [state.filters])

  const removeFilter = useCallback((key: keyof FilterState) => {
    setState((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        [key]:
          key === "textFilter" || key === "roleFilter" || key === "statusFilter"
            ? ""
            : null,
      },
      selectedRows: new Set(),
    }))
  }, [])

  return {
    ...state,
    filteredData,
    updateFilters,
    clearAllFilters,
    setSorting,
    toggleRowSelection,
    selectAllRows,
    getActiveFilters,
    removeFilter,
  }
}
