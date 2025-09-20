export interface TableRow {
  id: string
  name: string
  email: string
  role: "admin" | "user" | "moderator" | "guest"
  status: "active" | "inactive" | "pending" | "suspended"
  score: number
  department: string
  joinDate: string
  lastLogin: string
}

export interface FilterState {
  textFilter: string
  roleFilter: string
  statusFilter: string
  scoreMin: number | null
  scoreMax: number | null
}

export interface TableState {
  data: TableRow[]
  filteredData: TableRow[]
  selectedRows: Set<string>
  filters: FilterState
  sortColumn: keyof TableRow | null
  sortDirection: "asc" | "desc"
}

export interface Action {
  id: string
  label: string
  icon: string
  handler: (selectedIds: string[]) => void
}
