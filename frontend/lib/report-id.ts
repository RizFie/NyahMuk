export function formatReportId(id: string): string {
  return `#NM-${id.slice(-4).toUpperCase()}`;
}
