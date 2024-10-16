import { QuizzflyModule } from '@modules/quizzfly/quizzfly.module';
import { SlideEntity } from '@modules/slide/entity/slide.entity';
import { SlideRepository } from '@modules/slide/repository/slide.repository';
import { SlideController } from '@modules/slide/slide.controller';
import { SlideService } from '@modules/slide/slide.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([SlideEntity]), QuizzflyModule],
  controllers: [SlideController],
  providers: [SlideRepository, SlideService],
})
export class SlideModule {}
