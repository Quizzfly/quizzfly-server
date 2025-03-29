import { Uuid } from '@common/types/common.type';
import { StringField, UUIDField } from '@core/decorators/field.decorators';
import { Expose } from 'class-transformer';

export class ParticipantDto {
  @UUIDField()
  @Expose({ name: 'participant_id' })
  participantId: Uuid;

  @StringField()
  @Expose({ name: 'room_pin' })
  roomPin: string;
}
