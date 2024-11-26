import { StringField, UUIDField } from '@core/decorators/field.decorators';

export class UpdateLeaderBoardReqDto {
  @StringField()
  roomPin: string;

  @UUIDField()
  questionId: string;
}
