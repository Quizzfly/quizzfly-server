import { OffsetPaginatedDto } from '@/common/dto/offset-pagination/paginated.dto';
import { Uuid } from '@/common/types/common.type';
import { CurrentUser } from '@/core/decorators/current-user.decorator';
import { ApiAuth } from '@/core/decorators/http.decorators';
import { ValidateUuid } from '@/core/decorators/validators/uuid-validator';
import { ICurrentUser } from '@/core/interfaces';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { CreateFlashcardSetDto } from '../dto/request/create-flashcard-set.dto';
import { FilterFlashcardSetDto } from '../dto/request/filter-flashcard-set.dto';
import { UpdateFlashcardSetDto } from '../dto/request/update-flashcard-set.dto';
import { FlashcardSetDetailResDto } from '../dto/response/flashcard-set-detail.res.dto';
import { FlashcardSetResDto } from '../dto/response/flashcard-set.res.dto';
import { FlashcardSetMapper } from '../mapper/flashcard-set.mapper';
import { FlashcardSetService } from '../services/flashcard-set.service';

@ApiTags('Flashcard Set APIs')
@Controller({ path: 'flashcard-sets', version: '1' })
export class FlashcardSetController {
  constructor(private readonly service: FlashcardSetService) {}

  @Post()
  @ApiAuth({
    summary: 'Create flashcard set',
    description: 'Create flashcard set',
    type: FlashcardSetDetailResDto,
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
    type: FlashcardSetDetailResDto,
  })
  @ApiParam({ name: 'id', description: 'Flashcard set id' })
  async findById(
    @Param('id', ValidateUuid) id: Uuid,
    @CurrentUser() user: ICurrentUser,
  ) {
    const result = await this.service.findByIdAndDetail(id, user.id);
    return FlashcardSetMapper.toDetailDto(result);
  }

  @Get()
  @ApiAuth({
    summary: 'Get list flashcard set',
    description: 'Get list flashcard set',
    type: FlashcardSetResDto,
    paginationType: 'offset',
  })
  async paginate(@Query() query: FilterFlashcardSetDto) {
    const { data, meta } = await this.service.paginate(query);
    return new OffsetPaginatedDto(FlashcardSetMapper.toDtos(data), meta);
  }

  @Put(':id')
  @ApiAuth({
    summary: 'Update flashcard set by id',
    description: 'Update flashcard set by id',
    type: FlashcardSetDetailResDto,
  })
  @ApiParam({ name: 'id', description: 'Flashcard set id' })
  async update(
    @Param('id', ValidateUuid) id: Uuid,
    @CurrentUser() user: ICurrentUser,
    @Body() dto: UpdateFlashcardSetDto,
  ) {
    const result = await this.service.update(id, dto, user.id);
    return FlashcardSetMapper.toDto(result);
  }

  @Delete(':id')
  @ApiAuth({
    summary: 'Delete flashcard set by id',
    description: 'Delete flashcard set by id',
    statusCode: HttpStatus.NO_CONTENT,
  })
  @ApiParam({ name: 'id', description: 'Flashcard set id' })
  async delete(
    @Param('id', ValidateUuid) id: Uuid,
    @CurrentUser() user: ICurrentUser,
  ) {
    await this.service.delete(id, user.id);
  }
}
