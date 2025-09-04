export interface ExcelServiceExportPayload {
  courseId?: string
  groupId?: string
  startDate?: string
  endDate?: string
}
export interface ExcelServiceExportResponse {
  buffer: Buffer
  fileName: string
}
