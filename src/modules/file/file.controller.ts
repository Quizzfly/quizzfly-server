import { ResponseDataApi } from '@common/dto/general/response-data-api.dto';
import { ApiPublic } from '@core/decorators/http.decorators';
import { FileService } from '@modules/file/file.service';
import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';

@ApiTags('File APIs')
@Controller({
  path: 'files',
  version: '1',
})
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @ApiPublic({
    type: ResponseDataApi,
    summary: 'Upload file',
  })
  @Post('')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return ResponseDataApi.successWithoutMeta(
      await this.fileService.handleFileUpload(file),
    );
  }

  @ApiPublic({
    type: ResponseDataApi,
    summary: 'Upload multiple file',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @Post('multiple')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadMultipleFile(@UploadedFiles() files: Array<Express.Multer.File>) {
    return ResponseDataApi.successWithoutMeta(
      await this.fileService.handleMultipleFiles(files),
    );
  }
}
