import { SessionEntity } from '@modules/session/entities/session.entity';
import { SessionRepository } from '@modules/session/repositories/session.repository';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionService } from './session.service';

@Module({
  imports: [TypeOrmModule.forFeature([SessionEntity])],
  providers: [SessionService, SessionRepository],
  exports: [SessionService],
})
export class SessionModule {}
