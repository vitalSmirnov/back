export interface FileCreatePayload {
  file: File
}
export interface FileCreateResponse {
  id: string
  filename: string
  originalName: string
  mimetype: string
  size: number
  url: string
  uploadedAt: Date
}

export interface FileDeletePayload {
  id: string
}
export interface FileDeleteResponse {
  message: string
}

export interface FileGetPayload {
  id: string
}
export interface FileGetResponse {
  file: File
  mimeType: string
}
