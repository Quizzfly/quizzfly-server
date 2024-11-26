import { StringField, UUIDField } from '@core/decorators/field.decorators';

export class StartQuizReqDto {
  @StringField()
  roomPin: string;

  @UUIDField()
  quizzflyId: string;

  @UUIDField()
  hostId?: string;
}
