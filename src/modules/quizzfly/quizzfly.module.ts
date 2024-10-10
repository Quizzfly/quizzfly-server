import { QuizzflyEntity } from '@modules/quizzfly/entity/quizzfly.entity';
import { QuizzflyController } from '@modules/quizzfly/quizzfly.controller';
import { QuizzflyService } from '@modules/quizzfly/quizzfly.service';
import { QuizzflyRepository } from '@modules/quizzfly/repository/quizzfly.repository';
import { UserModule } from '@modules/user/user.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([QuizzflyEntity]), UserModule],
  controllers: [QuizzflyController],
  providers: [QuizzflyRepository, QuizzflyService],
})
export class QuizzflyModule {}
