import { Uuid } from '@/common/types/common.type';
import { CurrentUser } from '@/core/decorators/current-user.decorator';
import { ApiAuth } from '@/core/decorators/http.decorators';
import { ValidateUuid } from '@/core/decorators/validators/uuid-validator';
import { ICurrentUser } from '@/core/interfaces';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { CreateFlashcardSetDto } from '../dto/request/create-flashcard-set.dto';
import { FLashCardSetDetailResDto } from '../dto/response/flashcard-set-detail.res.dto';
import { FlashcardSetMapper } from '../mapper/flashcard-set.mapper';
import { FlashcardSetService } from '../services/flashcard-set.service';

@ApiTags('Flashcard Set APIs')
@Controller({ path: 'flashcard-set', version: '1' })
export class FlashcardSetController {
  constructor(private readonly service: FlashcardSetService) {}

  @Post()
  @ApiAuth({
    summary: 'Create flashcard set',
    description: 'Create flashcard set',
    type: FLashCardSetDetailResDto,
  })
  async create(
    @CurrentUser() user: ICurrentUser,
    @Body() dto: CreateFlashcardSetDto,
  ) {
    const result = await this.service.create(user.id, dto);
    return FlashcardSetMapper.toDetailDto(result);
  }

  @Get(':id')
  @ApiAuth({
    summary: 'Get flashcard set by id',
    description: 'Get flashcard set by id',
    type: FLashCardSetDetailResDto,
  })
  @ApiParam({ name: 'id', description: 'Flashcard set id' })
  async findById(@Param('id', ValidateUuid) id: Uuid) {
    const result = await this.service.findByIdAndDetail(id);
    return FlashcardSetMapper.toDetailDto(result);
  }
}
