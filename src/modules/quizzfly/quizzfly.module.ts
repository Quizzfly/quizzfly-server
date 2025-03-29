import { AdminQuizzflyController } from '@modules/quizzfly/controller/admin-quizzfly.controller';
import { QuizzflyController } from '@modules/quizzfly/controller/quizzfly.controller';
import { QuizzflyEntity } from '@modules/quizzfly/entity/quizzfly.entity';
import { QuizzflyService } from '@modules/quizzfly/quizzfly.service';
import { QuizzflyRepository } from '@modules/quizzfly/repository/quizzfly.repository';
import { UserModule } from '@modules/user/user.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([QuizzflyEntity]), UserModule],
  controllers: [QuizzflyController, AdminQuizzflyController],
  providers: [QuizzflyRepository, QuizzflyService],
  exports: [QuizzflyService],
})
export class QuizzflyModule {}
