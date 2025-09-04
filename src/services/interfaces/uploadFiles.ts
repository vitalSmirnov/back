export interface FileUploadServicePayload {
  file?: Express.Multer.File
}
export interface FileUploadServiceResponse {
  message: string
  file: {
    path: string
    originalName: string
    size: number
  }
}
