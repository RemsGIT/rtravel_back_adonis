import { MultipartFile } from '@adonisjs/core/bodyparser'
import app from '@adonisjs/core/services/app'
import { cuid } from '@adonisjs/core/helpers'
import { promises as fsPromises } from 'fs';

export default class FileUploaderService {
  async uploadFile(file: MultipartFile, path: string): Promise<string> {
    // Upload file
    await file.move(app.makePath(`public/uploads/${path}`), {
      name: `${cuid()}.${file.extname}`,
    })

    // Return the file path
    return file.filePath ? `uploads/${path}/${file.fileName}` : ''
  }

  async removeFile(path: string): Promise<boolean> {
    try {
      await fsPromises.unlink(path)
      return true
    } catch (error) {
      return false
    }
  }
}
