import { Uuid } from '@common/types/common.type';
import { ErrorCode } from '@core/constants/error-code/error-code.constant';
import { EventService } from '@core/events/event.service';
import { Optional } from '@core/utils/optional';
import { UpdatePositionQuizEvent } from '@modules/quiz/events';
import { QuizzflyService } from '@modules/quizzfly/quizzfly.service';
import { CreateSlideReqDto } from '@modules/slide/dto/request/create-slide.req.dto';
import { UpdateSlideReqDto } from '@modules/slide/dto/request/update-slide.req';
import { InfoSlideResDto } from '@modules/slide/dto/response/info-slide.res';
import { SlideEntity } from '@modules/slide/entity/slide.entity';
import {
  SlideAction,
  SlideScope,
  UpdateManySlideDto,
  UpdatePositionSlidePayLoad,
} from '@modules/slide/events';
import { SlideRepository } from '@modules/slide/repository/slide.repository';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Transactional } from 'typeorm-transactional';

@Injectable()
export class SlideService {
  constructor(
    private readonly slideRepository: SlideRepository,
    private readonly quizzflyService: QuizzflyService,
    private readonly eventService: EventService,
  ) {}

  @Transactional()
  async createSlide(userId: Uuid, quizzflyId: Uuid, dto: CreateSlideReqDto) {
    const quizzfly = await this.quizzflyService.findById(quizzflyId);
    if (quizzfly.userId !== userId) {
      throw new ForbiddenException(ErrorCode.ACCESS_DENIED);
    }
    const currentLastQuestion =
      await this.quizzflyService.getLastQuestion(quizzflyId);
    const slide = new SlideEntity({
      quizzflyId: quizzflyId,
      ...dto,
      prevElementId:
        currentLastQuestion !== null ? currentLastQuestion.id : null,
    });
    await this.slideRepository.save(slide);
    return slide.toDto(InfoSlideResDto);
  }

  @OnEvent(`${SlideScope}.${SlideAction.getSlideEntity}`)
  async findById(id: Uuid) {
    return Optional.of(
      await this.slideRepository.findOne({
        where: { id: id },
        relations: ['quizzfly'],
      }),
    )
      .throwIfNotPresent(new NotFoundException(ErrorCode.SLIDE_NOT_FOUND))
      .get();
  }

  async deleteSlideById(quizzflyId: Uuid, slideId: Uuid, userId: Uuid) {
    const slide = await this.findById(slideId);
    if (slide.quizzfly.userId !== userId || slide.quizzfly.id !== quizzflyId) {
      throw new ForbiddenException(ErrorCode.ACCESS_DENIED);
    }

    await this.slideRepository.softDelete({ id: slideId });

    const behindQuestion = await this.quizzflyService.getBehindQuestion(
      quizzflyId,
      slideId,
    );
    if (behindQuestion !== null) {
      if (behindQuestion.type === 'SLIDE') {
        await this.changePrevPointerSlide({
          slideId: behindQuestion.id,
          prevElementId: slide.prevElementId,
        });
      } else {
        await this.eventService.emitAsync(
          new UpdatePositionQuizEvent({
            quizId: behindQuestion.id,
            prevElementId: slide.prevElementId,
          }),
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
      throw new ForbiddenException(ErrorCode.FORBIDDEN);
    }
    Object.assign(slide, dto);

    await this.slideRepository.save(slide);
    return slide.toDto(InfoSlideResDto);
  }

  @OnEvent(`${SlideScope}.${SlideAction.setBackgroundForMany}`)
  async updateMany(payload: UpdateManySlideDto) {
    return this.slideRepository.update(
      { quizzflyId: payload.quizzflyId as Uuid },
      payload.dto,
    );
  }

  async duplicateSlide(quizzflyId: Uuid, slideId: Uuid, userId: Uuid) {
    const slide = await this.findById(slideId);
    if (slide.quizzfly.userId !== userId || slide.quizzfly.id !== quizzflyId) {
      throw new ForbiddenException(ErrorCode.FORBIDDEN);
    }
    const behindQuestion = await this.quizzflyService.getBehindQuestion(
      quizzflyId,
      slideId,
    );

    const duplicateSlide = new SlideEntity();
    duplicateSlide.content = slide.content;
    duplicateSlide.files = slide.files;
    duplicateSlide.backgroundUrl = slide.backgroundUrl;
    duplicateSlide.quizzfly = slide.quizzfly;
    duplicateSlide.prevElementId = slide.id;

    await this.slideRepository.save(duplicateSlide);

    if (behindQuestion !== null) {
      if (behindQuestion.type === 'SLIDE') {
        await this.changePrevPointerSlide({
          slideId: behindQuestion.id,
          prevElementId: duplicateSlide.id,
        });
      } else {
        await this.eventService.emitAsync(
          new UpdatePositionQuizEvent({
            quizId: behindQuestion.id,
            prevElementId: duplicateSlide.id,
          }),
        );
      }
    }

    return duplicateSlide.toDto(InfoSlideResDto);
  }

  @OnEvent(`${SlideScope}.${SlideAction.updatePosition}`)
  async changePrevPointerSlide(payload: UpdatePositionSlidePayLoad) {
    const slide = await this.findById(payload.slideId);
    slide.prevElementId = payload.prevElementId;
    await this.slideRepository.save(slide);
  }
}
