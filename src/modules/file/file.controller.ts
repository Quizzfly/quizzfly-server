import { ApiPublic } from '@core/decorators/http.decorators';
import { UploadFileDecorator } from '@core/decorators/upload-file.decorator';
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
  @UploadFileDecorator()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.fileService.handleFileUpload(file);
  }

  @ApiPublic({
    type: FileInfoResDto,
    summary: 'Upload multiple file',
    isArray: true,
  })
  @UploadFileDecorator()
  @Post('multiple')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadMultipleFile(@UploadedFiles() files: Array<Express.Multer.File>) {
    return this.fileService.handleMultipleFiles(files);
  }
}
