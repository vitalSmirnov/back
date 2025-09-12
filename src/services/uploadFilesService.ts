import { FileUploadServicePayload, FileUploadServiceResponse } from "./interfaces/uploadFiles.js"
import { HttpError } from "../lib/error/Error.js"
import { getFileInfo } from "../lib/utils/fileUtils.js"

export async function uploadFilesService({ file }: FileUploadServicePayload): Promise<FileUploadServiceResponse> {
  try {
    if (!file) {
      throw new HttpError("Файл не был загружен", 400)
    }

    const fileInfo = getFileInfo(file)

    return {
      message: "File uploaded successfully",
      file: {
        path: `uploads/proves/${fileInfo.filename}`,
        originalName: fileInfo.filename,
        size: fileInfo.size,
      },
    }
  } catch (e) {
    if (e instanceof HttpError) {
      throw e
    }
    throw new HttpError("Ошибка при загрузке файла", 500)
  }
}
