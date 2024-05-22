import sharp from 'sharp'

export default class FileCompressorService {
  async compressFile(inputBuffer: Buffer) {
    const { width } = await sharp(inputBuffer).metadata()
    let newBuffer: Buffer

    if (width && width > 1300) {
      newBuffer = await sharp(inputBuffer)
        .resize(1300, null, { fit: 'inside' })
        .jpeg({ quality: 80 })
        .toBuffer()
    } else {
      newBuffer = await sharp(inputBuffer).jpeg({ quality: 80 }).toBuffer()
    }

    return newBuffer
  }
}
