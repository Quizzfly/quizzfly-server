import { EmailField } from '@core/decorators/field.decorators';

export class InviteMemberToGroupReqDto {
  @EmailField({ isArray: true, each: true })
  emails: string[];
}
