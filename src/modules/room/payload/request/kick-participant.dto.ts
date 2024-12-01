import { Uuid } from '@common/types/common.type';
import { UUIDField } from '@core/decorators/field.decorators';
import { HostDto } from '@modules/room/payload/host.dto';
import { Expose } from 'class-transformer';

export class KickParticipantDto extends HostDto {
  @UUIDField()
  @Expose({ name: 'participant_id' })
  participantId: Uuid;
}
