import { ErrorDto } from '@common/dto/error.dto';
import { constraintErrors } from '@core/constants/error-code/constraint-errors';
import { ErrorCodeDetails } from '@core/constants/error-code/error-code-detail.constant';
import { ErrorCode } from '@core/constants/error-code/error-code.constant';
import { ValidationException } from '@core/exceptions/validation.exception';
import { I18nTranslations } from '@generated/i18n.generated';
import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { STATUS_CODES } from 'http';
import { I18nContext } from 'nestjs-i18n';
import { Socket } from 'socket.io';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';

@Catch(WsException, HttpException, Error)
export class WebsocketExceptionFilter extends BaseWsExceptionFilter {
  private readonly logger = new Logger(WebsocketExceptionFilter.name);
  private readonly i18n: I18nContext<I18nTranslations>;

  catch(exception: WsException | HttpException | Error, host: ArgumentsHost) {
    const client = host.switchToWs().getClient<Socket>();
    let message: any = 'Internal Server Error';
    if (exception instanceof HttpException) {
      message = exception.message;
    } else if (exception instanceof WsException) {
      message = exception.getError();
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    client.emit('exception', {
      status: 'error',
      message,
    });
  }

  /**
   * Handles HttpException
   * @param exception HttpException
   * @returns ErrorDto
   */
  private handleHttpException(exception: HttpException): ErrorDto {
    const statusCode = exception.getStatus();
    const message = ErrorCodeDetails[exception.message]
      ? this.i18n.t(
          ErrorCodeDetails[
            exception.message
          ] as unknown as keyof I18nTranslations,
        )
      : exception.message;
    const errorRes = {
      timestamp: new Date().toISOString(),
      statusCode,
      error: STATUS_CODES[statusCode],
      errorCode: exception.message ?? undefined,
      message,
    } as unknown as ErrorDto;

    this.logger.debug(exception);

    return errorRes;
  }

  /**
   * Handles QueryFailedError
   * @param error QueryFailedError
   * @returns ErrorDto
   */
  private handleQueryFailedError(error: QueryFailedError): ErrorDto {
    const r = error as QueryFailedError & { constraint?: string };
    const { status, message } = r.constraint?.startsWith('UQ')
      ? {
          status: HttpStatus.CONFLICT,
          message: r.constraint
            ? this.i18n.t(
                (constraintErrors[r.constraint] ||
                  r.constraint) as keyof I18nTranslations,
              )
            : undefined,
        }
      : {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: this.i18n.t('common.error.internal_server_error'),
        };
    const errorRes = {
      timestamp: new Date().toISOString(),
      statusCode: status,
      error: STATUS_CODES[status],
      message,
    } as unknown as ErrorDto;

    this.logger.error(error);

    return errorRes;
  }

  /**
   * Handles EntityNotFoundError when using findOrFail() or findOneOrFail() from TypeORM
   * @param error EntityNotFoundError
   * @returns ErrorDto
   */
  private handleEntityNotFoundError(error: EntityNotFoundError): ErrorDto {
    const status = HttpStatus.NOT_FOUND;
    const errorRes = {
      timestamp: new Date().toISOString(),
      statusCode: status,
      error: STATUS_CODES[status],
      message: this.i18n.t('common.error.entity_not_found'),
    } as unknown as ErrorDto;

    this.logger.debug(error);

    return errorRes;
  }

  /**
   * Handles validation errors
   * @param exception ValidationException
   * @returns ErrorDto
   */
  private handleValidationException(exception: ValidationException): ErrorDto {
    const r = exception.getResponse() as {
      errorCode: ErrorCode;
      message: string;
    };
    const statusCode = exception.getStatus();
    const message =
      r.message ||
      this.i18n.t(r.errorCode as unknown as keyof I18nTranslations);

    const errorRes = {
      timestamp: new Date().toISOString(),
      statusCode,
      error: STATUS_CODES[statusCode],
      errorCode: r.errorCode,
      message,
    };

    this.logger.debug(exception);

    return errorRes;
  }

  /**
   * Handles generic errors
   * @param error Error
   * @returns ErrorDto
   */
  private handleErrorInternal(error: Error): ErrorDto {
    const statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    const errorRes = {
      timestamp: new Date().toISOString(),
      statusCode,
      error: STATUS_CODES[statusCode],
      message:
        this.i18n.t('common.error.internal_server_error') ||
        'An unexpected error occurred',
    };

    this.logger.error(error);

    return errorRes;
  }
}
