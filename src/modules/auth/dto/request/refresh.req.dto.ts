import { TokenField } from '@core/decorators/field.decorators';

export class RefreshReqDto {
  @TokenField()
  refreshToken!: string;
}
