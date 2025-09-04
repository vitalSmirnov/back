export interface FileUploadResponse {
  message: string
  file: {
    path: string
    originalName: string
    size: number
  }
}
