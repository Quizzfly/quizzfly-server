import { ApiPublic } from '@core/decorators/http.decorators';
import { FileInfoResDto } from '@modules/file/dto/file-info.res.dto';
import { FileService } from '@modules/file/file.service';
import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.fileService.handleFileUpload(file);
  }
}
