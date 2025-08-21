import { Uuid } from '@/common/types/common.type';
import { CurrentUser } from '@/core/decorators/current-user.decorator';
import { ApiAuth } from '@/core/decorators/http.decorators';
import { ICurrentUser } from '@/core/interfaces';
import {
  Body,
  Controller,
  Delete,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { CreateFlashcardDto } from '../dto/request/create-flashcard.dto';
import { ReorderFlashcardDto } from '../dto/request/reorder-flashcard.dto';
import { UpdateFlashcardDto } from '../dto/request/update-flashcard.dto';
import { FlashcardResDto } from '../dto/response/flashcard.res.dto';
import { FlashcardMapper } from '../mapper/flashcard.mapper';
import { FlashcardService } from '../services/flashcard.service';

@Controller({ path: 'flashcards', version: '1' })
@ApiTags('Flashcard APIs')
export class FlashcardController {
  constructor(private readonly flashCardService: FlashcardService) {}

  @Post()
  @ApiAuth({
    summary: 'Create a flashcard',
    description: 'Create a flashcard',
    type: FlashcardResDto,
    statusCode: HttpStatus.CREATED,
  })
  async create(
    @Body() dto: CreateFlashcardDto,
    @CurrentUser() user: ICurrentUser,
  ) {
    const data = await this.flashCardService.create(user.id, dto);
    return FlashcardMapper.toDto(data);
  }

  @Put(':id')
  @ApiAuth({
    summary: 'Update a flashcard',
    description: 'Update a flashcard',
    type: FlashcardResDto,
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async update(
    @Param('id') id: Uuid,
    @Body() dto: UpdateFlashcardDto,
    @CurrentUser() user: ICurrentUser,
  ) {
    const data = await this.flashCardService.update(id, dto, user.id);
    return FlashcardMapper.toDto(data);
  }

  @Put(':id/reorder')
  @ApiAuth({
    summary: 'Reorder a flashcard',
    description: 'Reorder a flashcard',
    type: FlashcardResDto,
    statusCode: HttpStatus.OK,
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async reorder(
    @Param('id') id: Uuid,
    @Body() dto: ReorderFlashcardDto,
    @CurrentUser() user: ICurrentUser,
  ) {
    const data = await this.flashCardService.reorder(id, dto, user.id);
    return FlashcardMapper.toDto(data);
  }

  @Delete(':id')
  @ApiAuth({
    summary: 'Delete a flashcard',
    description: 'Delete a flashcard',
    statusCode: HttpStatus.NO_CONTENT,
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async delete(@Param('id') id: Uuid, @CurrentUser() user: ICurrentUser) {
    await this.flashCardService.delete(id, user.id);
  }
}
