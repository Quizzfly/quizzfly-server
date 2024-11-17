import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { ErrorDetailDto } from './error-detail.dto';

export class ErrorDto {
  @ApiProperty()
  timestamp: string;

  @ApiProperty({ name: 'status_code' })
  statusCode: number;

  @ApiProperty()
  error: string;

  @ApiPropertyOptional()
  @Expose()
  errorCode?: string;

  @ApiProperty()
  message: string;

  @ApiPropertyOptional({ type: ErrorDetailDto, isArray: true })
  details?: ErrorDetailDto[];

  stack?: string;

  trace?: Error | unknown;
}
