import { ErrorCode } from '@core/constants/error-code.constant';
import { ValidationException } from '@core/exceptions/validation.exception';
import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { isUUID } from 'class-validator';

@Injectable()
export class ValidateUuid implements PipeTransform<string> {
  transform(value: string, metadata: ArgumentMetadata): string {
    if (isUUID(value)) return value;
    throw new ValidationException(ErrorCode.V000, 'Id must be a uuid');
  }
}
