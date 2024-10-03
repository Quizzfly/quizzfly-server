import { FileInfoResDto } from '@modules/file/dto/file-info.res.dto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import bufferToStream from 'buffer-to-stream';
import {
  v2 as cloudinary,
  UploadApiErrorResponse,
  UploadApiResponse,
  v2,
} from 'cloudinary';

@Injectable()
export class FileService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('file.cloudName'),
      api_key: this.configService.get<string>('file.apiKey'),
      api_secret: this.configService.get<string>('file.apiSecret'),
    });
  }

  uploadImages(files: Array<Express.Multer.File>): Promise<Array<string>> {
    return new Promise(async (resolve, reject) => {
      try {
        const urls: Array<string> = [];

        for (const file of files) {
          const upload = await this.uploadImageToCloudinary(file);
          if ('secure_url' in upload) {
            urls.push(upload.secure_url);
          }
        }

        resolve(urls);
      } catch (error) {
        reject(error);
      }
    });
  }

  async uploadImageToCloudinary(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const upload = v2.uploader.upload_stream((error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
      const stream = bufferToStream(file.buffer);
      stream.pipe(upload);
    });
  }

  async handleFileUpload(file: Express.Multer.File): Promise<FileInfoResDto> {
    const cloudinaryResponse = await this.uploadImageToCloudinary(file);
    return this.toFileInfoResponse(cloudinaryResponse as UploadApiResponse);
  }

  async toFileInfoResponse(cloudinaryResponse: UploadApiResponse) {
    const fileResponse = new FileInfoResDto();
    fileResponse.format = cloudinaryResponse.format;
    fileResponse.resourceType = cloudinaryResponse.resource_type;
    fileResponse.url = cloudinaryResponse.secure_url;
    fileResponse.bytes = cloudinaryResponse.bytes;
    return fileResponse;
  }
}
