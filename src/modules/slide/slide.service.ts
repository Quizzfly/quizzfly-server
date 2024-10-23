import { Uuid } from '@common/types/common.type';
import { ErrorCode } from '@core/constants/error-code.constant';
import { Optional } from '@core/utils/optional';
import { QuizzflyService } from '@modules/quizzfly/quizzfly.service';
import { CreateSlideReqDto } from '@modules/slide/dto/request/create-slide.req.dto';
import { UpdateSlideReqDto } from '@modules/slide/dto/request/update-slide.req';
import { InfoSlideResDto } from '@modules/slide/dto/response/info-slide.res';
import { SlideEntity } from '@modules/slide/entity/slide.entity';
import { SlideRepository } from '@modules/slide/repository/slide.repository';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';

@Injectable()
export class SlideService {
  constructor(
    private readonly slideRepository: SlideRepository,
    private readonly quizzflyService: QuizzflyService,
  ) {}

  @Transactional()
  async createSlide(userId: Uuid, quizzflyId: Uuid, dto: CreateSlideReqDto) {
    const quizzfly = await this.quizzflyService.findById(quizzflyId);
    if (quizzfly.userId !== userId) {
      throw new ForbiddenException(ErrorCode.E004);
    }

    const slide = new SlideEntity();
    slide.quizzflyId = quizzflyId;
    await slide.save();
    return slide.toDto(InfoSlideResDto);
  }

  async findById(id: Uuid) {
    return Optional.of(
      await this.slideRepository.findOne({
        where: { id: id },
        relations: ['quizzfly'],
      }),
    )
      .throwIfNotPresent(new NotFoundException(ErrorCode.E005))
      .get();
  }

  async deleteSlideById(quizzflyId: Uuid, slideId: Uuid, userId: Uuid) {
    const slide = await this.findById(slideId);
    if (slide.quizzfly.userId !== userId || slide.quizzfly.id !== quizzflyId) {
      throw new ForbiddenException(ErrorCode.E004);
    }

    slide.deletedAt = new Date();
    await this.slideRepository.save(slide);
  }

  async updateSlide(
    quizzflyId: Uuid,
    slideId: Uuid,
    userId: Uuid,
    dto: UpdateSlideReqDto,
  ) {
    const slide = await this.findById(slideId);
    if (slide.quizzfly.userId !== userId || slide.quizzfly.id !== quizzflyId) {
      throw new ForbiddenException(ErrorCode.E004);
    }

    slide.content = dto.content;
    slide.files = dto.files;
    slide.backgroundColor = dto.backgroundColor;

    await this.slideRepository.save(slide);
    return slide.toDto(InfoSlideResDto);
  }

  async duplicateSlide(quizzflyId: Uuid, slideId: Uuid, userId: Uuid) {
    console.log(slideId);
    const slide = await this.findById(slideId);
    if (slide.quizzfly.userId !== userId || slide.quizzfly.id !== quizzflyId) {
      throw new ForbiddenException(ErrorCode.E004);
    }

    const duplicateSlide = new SlideEntity();
    duplicateSlide.content = slide.content;
    duplicateSlide.files = slide.files;
    duplicateSlide.backgroundColor = slide.backgroundColor;
    duplicateSlide.quizzfly = slide.quizzfly;

    await this.slideRepository.save(duplicateSlide);
    return duplicateSlide.toDto(InfoSlideResDto);
  }
}
