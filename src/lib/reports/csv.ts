/**
 * CSV generation utilities for admin reports
 */

export interface CSVColumn {
  key: string
  header: string
  formatter?: (value: any) => string
}

/**
 * Generates a CSV string from data array
 */
export function generateCSV<T extends Record<string, any>>(
  data: T[],
  columns: CSVColumn[]
): string {
  if (data.length === 0) {
    return columns.map(col => col.header).join(",")
  }

  // Header row
  const header = columns.map(col => escapeCSVField(col.header)).join(",")

  // Data rows
  const rows = data.map(item => {
    return columns
      .map(col => {
        const value = getNestedValue(item, col.key)
        const formatted = col.formatter ? col.formatter(value) : String(value ?? "")
        return escapeCSVField(formatted)
      })
      .join(",")
  })

  return [header, ...rows].join("\n")
}

/**
 * Escapes a CSV field value
 */
function escapeCSVField(value: string): string {
  // If the value contains comma, newline, or double quote, wrap in quotes
  if (value.includes(",") || value.includes("\n") || value.includes('"')) {
    // Escape double quotes by doubling them
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

/**
 * Gets a nested value from an object using dot notation
 */
function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((current, key) => {
    return current?.[key]
  }, obj)
}

/**
 * Creates a downloadable CSV file
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Formats a date for CSV export
 */
export function formatDateForCSV(date: Date | string | null): string {
  if (!date) return ""
  const d = new Date(date)
  return d.toLocaleDateString("pt-BR") + " " + d.toLocaleTimeString("pt-BR")
}

/**
 * Formats a boolean for CSV export
 */
export function formatBooleanForCSV(value: boolean | null): string {
  if (value === null || value === undefined) return ""
  return value ? "Sim" : "Não"
}

/**
 * Formats a number for CSV export
 */
export function formatNumberForCSV(value: number | null, decimals: number = 2): string {
  if (value === null || value === undefined) return ""
  return value.toFixed(decimals)
}
