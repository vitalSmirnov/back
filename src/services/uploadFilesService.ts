import { getFileInfo } from "../lib/utils/fileUtils.js"
import { FileUploadServicePayload, FileUploadServiceResponse } from "./interfaces/uploadFiles.js"

export async function uploadFilesService({ file }: FileUploadServicePayload): Promise<FileUploadServiceResponse> {
  if (!file) throw new Error("Файл не был загружен")

  const fileInfo = getFileInfo(file)

  return {
    message: "File uploaded successfully",
    file: {
      path: `uploads/proves/${fileInfo.filename}`,
      originalName: fileInfo.filename,
      size: fileInfo.size,
    },
  }
}
