import { UUIDField } from '@core/decorators/field.decorators';
import { HostDto } from '@modules/room/payload/host.dto';
import { Expose } from 'class-transformer';

export class UpdateLeaderBoardDto extends HostDto {
  @UUIDField()
  @Expose({ name: 'question_id' })
  questionId: string;
}
