import { FileController } from '@modules/file/file.controller';
import { FileService } from '@modules/file/file.service';
import { Module } from '@nestjs/common';

@Module({
  providers: [FileService],
  controllers: [FileController],
})
export class FileModule {}
