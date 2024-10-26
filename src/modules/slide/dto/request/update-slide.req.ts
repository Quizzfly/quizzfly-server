import { CreateSlideReqDto } from '@modules/slide/dto/request/create-slide.req.dto';
import { PartialType } from '@nestjs/swagger';

export class UpdateSlideReqDto extends PartialType(CreateSlideReqDto) {}
