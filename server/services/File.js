import * as uuid from 'uuid'
import * as path from 'path'
import fs from 'fs'

const STATIC_DIR = path.resolve('static')
const IMAGE_MIME_TO_EXT = {
    'image/jpeg': 'jpeg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
}
const MAX_FILE_SIZE = Number.parseInt(process.env.UPLOAD_MAX_FILE_SIZE ?? '5242880', 10)

class File {
    async save(file) {
        if (!file) return null
        if (Array.isArray(file)) {
            throw new Error('Разрешена загрузка только одного файла')
        }
        const ext = IMAGE_MIME_TO_EXT[file.mimetype]
        if (!ext) {
            throw new Error('Недопустимый формат файла')
        }
        if (file.size > MAX_FILE_SIZE) {
            throw new Error('Превышен допустимый размер файла')
        }
        const fileName = uuid.v4() + '.' + ext
        const filePath = path.resolve(STATIC_DIR, fileName)
        await file.mv(filePath)
        return fileName
    }

    delete(file) {
        if (!file) return
        const filePath = path.resolve(STATIC_DIR, file)
        if (!filePath.startsWith(STATIC_DIR + path.sep)) {
            return
        }
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath)
        }
    }
}

export default new File()
