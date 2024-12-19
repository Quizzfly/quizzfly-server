import { Uuid } from '@common/types/common.type';
import { ROLE } from '@core/constants/entity.enum';

export type JwtPayloadType = {
  id: string;
  role: ROLE;
  sessionId: string;
  iat: number;
  exp: number;
};

export interface ICurrentUser {
  id: Uuid;
  role: ROLE;
  sessionId?: Uuid;
}
