import { Uuid } from '@common/types/common.type';
import { ErrorCode } from '@core/constants/error-code.constant';
import { Optional } from '@core/utils/optional';
import { QuizzflyService } from '@modules/quizzfly/quizzfly.service';
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
  async createSlide(userId: Uuid, quizzflyId: Uuid) {
    const quizzfly = await this.quizzflyService.findById(quizzflyId);
    if (quizzfly.userId !== userId) {
      throw new ForbiddenException(ErrorCode.E004);
    }

    const slide = new SlideEntity();
    slide.quizzflyId = quizzflyId;
    await slide.save();
    return (await this.slideRepository.findOneBy({ id: slide.id })).toDto(
      InfoSlideResDto,
    );
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

    await this.slideRepository.softDelete({ id: slideId });
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
    Object.assign(slide, dto);

    await this.slideRepository.save(slide);
    return (await this.slideRepository.findOneBy({ id: slideId })).toDto(
      InfoSlideResDto,
    );
  }

  async duplicateSlide(quizzflyId: Uuid, slideId: Uuid, userId: Uuid) {
    const slide = await this.findById(slideId);
    if (slide.quizzfly.userId !== userId || slide.quizzfly.id !== quizzflyId) {
      throw new ForbiddenException(ErrorCode.E004);
    }

    const duplicateSlide = new SlideEntity();
    duplicateSlide.content = slide.content;
    duplicateSlide.files = slide.files;
    duplicateSlide.backgroundColor = slide.backgroundColor;
    duplicateSlide.quizzflyId = slide.quizzflyId;

    await this.slideRepository.save(duplicateSlide);
    return (
      await this.slideRepository.findOneBy({ id: duplicateSlide.id })
    ).toDto(InfoSlideResDto);
  }
}
