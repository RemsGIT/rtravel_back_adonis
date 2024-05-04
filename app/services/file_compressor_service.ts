import sharp from 'sharp'

export default class FileCompressorService {
  async compressFile(inputBuffer: Buffer) {
    const { width } = await sharp(inputBuffer).metadata()
    let newBuffer: Buffer

    if (width && width > 800) {
      newBuffer = await sharp(inputBuffer)
        .resize(800, null, { fit: 'inside' })
        .jpeg({ quality: 80 })
        .toBuffer()
    } else {
      newBuffer = await sharp(inputBuffer)
        .resize(1000, null, { fit: 'inside' }) // 300 is less than 600
        .jpeg({ quality: 80 })
        .toBuffer()
    }

    return newBuffer
  }
}
