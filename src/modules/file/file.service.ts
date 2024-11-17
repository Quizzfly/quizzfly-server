import { ErrorCode } from '@core/constants/error-code/error-code.constant';
import { FileInfoResDto } from '@modules/file/dto/file-info.res.dto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import bufferToStream from 'buffer-to-stream';
import {
  UploadApiErrorResponse,
  UploadApiResponse,
  v2 as cloudinary,
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
    if (!file) {
      throw new BadRequestException(ErrorCode.FILE_NOT_EMPTY);
    }
    const cloudinaryResponse = await this.uploadImageToCloudinary(file);
    return this.toFileInfoResponse(cloudinaryResponse as UploadApiResponse);
  }

  async handleMultipleFiles(
    files: Array<Express.Multer.File>,
  ): Promise<Array<FileInfoResDto>> {
    const listFileInfoResponse: Array<FileInfoResDto> = [];
    if (!files || files.length === 0) {
      throw new BadRequestException(ErrorCode.FILE_NOT_EMPTY);
    }
    for (const file of files) {
      const cloudinaryResponse = await this.uploadImageToCloudinary(file);
      listFileInfoResponse.push(
        await this.toFileInfoResponse(cloudinaryResponse as UploadApiResponse),
      );
    }

    return listFileInfoResponse;
  }

  async toFileInfoResponse(cloudinaryResponse: UploadApiResponse) {
    const fileResponse = new FileInfoResDto();
    fileResponse.publicId = cloudinaryResponse.public_id;
    fileResponse.originalFilename = cloudinaryResponse.original_filename;
    fileResponse.format = cloudinaryResponse.format;
    fileResponse.resourceType = cloudinaryResponse.resource_type;
    fileResponse.url = cloudinaryResponse.secure_url;
    fileResponse.bytes = cloudinaryResponse.bytes;
    return fileResponse;
  }
}
