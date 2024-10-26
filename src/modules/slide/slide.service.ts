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
    const currentLastQuestion =
      await this.quizzflyService.getLastQuestion(quizzflyId);

    const slide = new SlideEntity({
      quizzflyId: quizzflyId,
      content: dto.content,
      prevElementId:
        currentLastQuestion !== null ? currentLastQuestion.id : null,
    });
    await this.slideRepository.save(slide);
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

    await this.slideRepository.softDelete({ id: slideId });

    const behindQuestion = await this.quizzflyService.getBehindQuestion(
      quizzflyId,
      slideId,
    );
    if (behindQuestion !== null) {
      if (behindQuestion.type === 'SLIDE') {
        await this.changePrevPointerSlide(
          behindQuestion.id,
          slide.prevElementId,
        );
      }
    }
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
    return slide.toDto(InfoSlideResDto);
  }

  async duplicateSlide(quizzflyId: Uuid, slideId: Uuid, userId: Uuid) {
    const slide = await this.findById(slideId);
    if (slide.quizzfly.userId !== userId || slide.quizzfly.id !== quizzflyId) {
      throw new ForbiddenException(ErrorCode.E004);
    }
    const behindQuestion = await this.quizzflyService.getBehindQuestion(
      quizzflyId,
      slideId,
    );

    const duplicateSlide = new SlideEntity();
    duplicateSlide.content = slide.content;
    duplicateSlide.files = slide.files;
    duplicateSlide.backgroundColor = slide.backgroundColor;
    duplicateSlide.quizzfly = slide.quizzfly;
    duplicateSlide.prevElementId = slide.id;

    await this.slideRepository.save(duplicateSlide);

    if (behindQuestion !== null) {
      if (behindQuestion.type === 'SLIDE') {
        await this.changePrevPointerSlide(behindQuestion.id, duplicateSlide.id);
      }
    }

    return duplicateSlide.toDto(InfoSlideResDto);
  }

  async changePrevPointerSlide(slideId: Uuid, prevElementId: Uuid) {
    const slide = await this.findById(slideId);
    slide.prevElementId = prevElementId;
    await this.slideRepository.save(slide);
  }
}
