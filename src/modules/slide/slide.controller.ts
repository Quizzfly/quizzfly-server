import { Uuid } from '@common/types/common.type';
import { CurrentUser } from '@core/decorators/current-user.decorator';
import { ApiAuth } from '@core/decorators/http.decorators';
import { CreateSlideReqDto } from '@modules/slide/dto/request/create-slide.req.dto';
import { UpdateSlideReqDto } from '@modules/slide/dto/request/update-slide.req';
import { InfoSlideResDto } from '@modules/slide/dto/response/info-slide.res';
import { SlideService } from '@modules/slide/slide.service';
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

@ApiTags('Slide APIs')
@Controller({
  version: '1',
})
export class SlideController {
  constructor(private readonly slideService: SlideService) {}

  @Post('quizzfly/:quizzflyId/slides')
  @ApiAuth({
    summary: 'Create a slide quizzfly',
    statusCode: HttpStatus.CREATED,
    type: InfoSlideResDto,
  })
  @ApiParam({
    name: 'quizzflyId',
    description: 'The UUID of the Quizzfly',
    type: 'string',
  })
  async createSlide(
    @CurrentUser('id') userId: Uuid,
    @Param('quizzflyId') quizzflyId: Uuid,
    @Body() dto: CreateSlideReqDto,
  ) {
    return this.slideService.createSlide(userId, quizzflyId, dto);
  }

  @Post('quizzfly/:quizzflyId/slides/:slideId/duplicate')
  @ApiAuth({
    summary: 'Duplicate a slide quizzfly',
  })
  @ApiParam({
    name: 'quizzflyId',
    description: 'The UUID of the Quizzfly',
    type: 'string',
  })
  @ApiParam({
    name: 'slideId',
    description: 'The UUID of the Slide',
    type: 'string',
  })
  async duplicateSlide(
    @CurrentUser('id') userId: Uuid,
    @Param('quizzflyId') quizzflyId: Uuid,
    @Param('slideId') slideId: Uuid,
  ) {
    return this.slideService.duplicateSlide(quizzflyId, slideId, userId);
  }

  @Put('quizzfly/:quizzflyId/slides/:slideId')
  @ApiAuth({
    type: InfoSlideResDto,
    summary: 'Update a slide quizzfly',
  })
  @ApiParam({
    name: 'quizzflyId',
    description: 'The UUID of the Quizzfly',
    type: 'string',
  })
  @ApiParam({
    name: 'slideId',
    description: 'The UUID of the Slide',
    type: 'string',
  })
  async updateSlide(
    @CurrentUser('id') userId: Uuid,
    @Param('quizzflyId') quizzflyId: Uuid,
    @Param('slideId') slideId: Uuid,
    @Body() dto: UpdateSlideReqDto,
  ) {
    return this.slideService.updateSlide(quizzflyId, slideId, userId, dto);
  }

  @Delete('quizzfly/:quizzflyId/slides/:slideId')
  @ApiAuth({
    summary: 'Delete a slide quizzfly',
  })
  @ApiParam({
    name: 'quizzflyId',
    description: 'The UUID of the Quizzfly',
    type: 'string',
  })
  @ApiParam({
    name: 'slideId',
    description: 'The UUID of the Slide',
    type: 'string',
  })
  async deleteSlide(
    @CurrentUser('id') userId: Uuid,
    @Param('slideId') slideId: Uuid,
    @Param('quizzflyId') quizzflyId: Uuid,
  ) {
    return this.slideService.deleteSlideById(quizzflyId, slideId, userId);
  }
}
