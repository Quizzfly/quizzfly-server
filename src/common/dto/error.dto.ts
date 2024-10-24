import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ErrorDetailDto } from './error-detail.dto';

export class ErrorDto {
  @ApiProperty()
  timestamp: string;

  @ApiProperty({ name: 'status_code' })
  statusCode: number;

  @ApiProperty()
  error: string;

  @ApiPropertyOptional({ name: 'error_code' })
  errorCode?: string;

  @ApiProperty()
  message: string;

  @ApiPropertyOptional({ type: ErrorDetailDto, isArray: true })
  details?: ErrorDetailDto[];

  stack?: string;

  trace?: Error | unknown;
}
