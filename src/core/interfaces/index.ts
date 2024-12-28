import { Uuid } from '@common/types/common.type';
import { ROLE } from '@core/constants/entity.enum';

export interface ICurrentUser {
  id: Uuid;
  role: ROLE;
  sessionId?: Uuid;
  permissions: string[];
}
