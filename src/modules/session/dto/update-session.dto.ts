import { PickType } from '@nestjs/swagger';
import { CreateSessionDto } from './create-session.dto';

export class UpdateSessionDto extends PickType(CreateSessionDto, ['hash']) {}
