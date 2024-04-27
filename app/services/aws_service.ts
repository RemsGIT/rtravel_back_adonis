import AWS from 'aws-sdk'
import env from '#start/env'

export default class AwsService {

  private s3: AWS.S3


  constructor() {
    this.s3 = new AWS.S3({
      region: 'VOTRE_REGION_AWS',
      credentials: {
        accessKeyId: env.get('AWS_ACCESS_KEY'),
        secretAccessKey: env.get('AWS_SECRET_ACCESS_KEY'),
      },
    })
  }

  async uploadFile(buffer: Buffer, file_name: string): Promise<boolean> {
    if (!!buffer || !!file_name) return false

    const params = {
      Bucket: env.get('AWS_BUCKET_NAME'),
      Key: file_name,
      Body: buffer,
      ACL: 'public-read',
    }

    try {
      const uploadedFile = await this.s3.upload(params).promise()
      if (uploadedFile.Location) return true
    } catch (e) {
      console.log('error while uploading')
      console.log(e)
    }

    return false
  }

}
