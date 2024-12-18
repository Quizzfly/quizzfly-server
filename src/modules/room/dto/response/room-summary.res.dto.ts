import { ClassField } from '@core/decorators/field.decorators';
import { RoomReportResDto } from '@modules/room/dto/response/room-report.res.dto';
import { BaseUserDto } from '@shared/dto/base-user.dto';
import { Expose, Transform } from 'class-transformer';

@Expose()
export class RoomSummaryResDto extends RoomReportResDto {
  @ClassField(() => BaseUserDto)
  @Transform(({ obj }): BaseUserDto => {
    return {
      id: obj?.hostId,
      name: obj?.hostName,
      avatar: obj?.hostAvatar,
      email: obj?.hostEmail,
      username: obj?.hostUsername,
    };
  })
  @Expose()
  host: BaseUserDto;
}
