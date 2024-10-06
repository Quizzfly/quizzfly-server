import { ResponseDataApi } from '@common/dto/general/response-data-api.dto';
import { ApiPublic } from '@core/decorators/http.decorators';
import { UploadFileDecorator } from '@core/decorators/upload-file.decorator';
import { FileService } from '@modules/file/file.service';
import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';

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
  @UploadFileDecorator()
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
  @UploadFileDecorator()
  @Post('multiple')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadMultipleFile(@UploadedFiles() files: Array<Express.Multer.File>) {
    return ResponseDataApi.successWithoutMeta(
      await this.fileService.handleMultipleFiles(files),
    );
  }
}
