import { PageOptionsDto } from '@common/dto/offset-pagination/page-options.dto';
import { PartialType } from '@nestjs/swagger';

export class QueryQuizzflyReqDto extends PartialType(PageOptionsDto) {}
