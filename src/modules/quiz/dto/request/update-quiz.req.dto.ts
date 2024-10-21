import { CreateQuizReqDto } from '@modules/quiz/dto/request/create-quiz.req.dto';
import { PartialType } from '@nestjs/swagger';

export class UpdateQuizReqDto extends PartialType(CreateQuizReqDto) {}
