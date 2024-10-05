import { ResponseDataApi } from '@common/dto/general/response-data-api.dto';
import { ApiPublic } from '@core/decorators/http.decorators';
import { FileInfoResDto } from '@modules/file/dto/file-info.res.dto';
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
    type: FileInfoResDto,
    summary: 'Upload file',
  })
  @Post('')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return ResponseDataApi.successWithoutMeta(
      await this.fileService.handleFileUpload(file),
    );
  }

  @ApiPublic({
    type: Array<FileInfoResDto>,
    summary: 'Upload multiple file',
  })
  @Post('multiple')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadMultipleFile(@UploadedFiles() files: Array<Express.Multer.File>) {
    return ResponseDataApi.successWithoutMeta(
      await this.fileService.handleMultipleFiles(files),
    );
  }
}
