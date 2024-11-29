import { QuizzflyModule } from '@modules/quizzfly/quizzfly.module';
import { RoomEntity } from '@modules/room/entities/room.entity';
import { RoomRepository } from '@modules/room/repositories/room.repository';
import { RoomController } from '@modules/room/room.controller';
import { RoomService } from '@modules/room/room.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([RoomEntity]), QuizzflyModule],
  controllers: [RoomController],
  providers: [RoomRepository, RoomService],
})
export class RoomModule {}
