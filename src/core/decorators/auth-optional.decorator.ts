import { IS_AUTH_OPTIONAL } from '@core/constants/app.constant';
import { SetMetadata } from '@nestjs/common';

export const AuthOptional = () => SetMetadata(IS_AUTH_OPTIONAL, true);
