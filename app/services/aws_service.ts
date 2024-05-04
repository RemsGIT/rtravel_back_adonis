import AWS from 'aws-sdk'
import env from '#start/env'
import { inject } from '@adonisjs/core'
import FileCompressorService from '#services/file_compressor_service'

@inject()
export default class AwsService {
  private s3: AWS.S3

  constructor(private fileCompressorService: FileCompressorService) {
    this.s3 = new AWS.S3({
      region: env.get('AWS_REGION'),
      credentials: {
        accessKeyId: env.get('AWS_ACCESS_KEY'),
        secretAccessKey: env.get('AWS_SECRET_ACCESS_KEY'),
      },
    })
  }

  async uploadFile(file: Buffer, file_name: string): Promise<string> {
    if (!file_name) return ''

    file = await this.fileCompressorService.compressFile(file)

    const params = {
      Bucket: env.get('AWS_BUCKET_NAME'),
      Key: file_name,
      Body: file,
      ACL: 'public-read',
    }

    try {
      const uploadedFile = await this.s3.upload(params).promise()
      if (uploadedFile.Location) return `${env.get('AWS_S3_URL')}/${file_name}`
    } catch (e) {
      console.log('error while uploading')
      console.log(e)
    }

    return ''
  }

  async removeFile(path: string): Promise<boolean> {
    if (!path) return false

    const params = {
      Bucket: env.get('AWS_BUCKET_NAME'),
      Key: path,
    }

    try {
      await this.s3.deleteObject(params).promise()

      return true
    } catch (e) {
      console.log('error while deleting')
      console.log(e)
    }
    return false
  }
}
