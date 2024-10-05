import { FAILURE, SUCCESS } from '@core/constants/app.constant';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ResponseDataApi {
  @ApiPropertyOptional()
  status: string;

  @ApiProperty()
  data: object;

  @ApiProperty()
  error: object;

  @ApiProperty()
  meta: object;

  static success(data: object, meta: object): ResponseDataApi {
    return ResponseDataApi.builder()
      .setStatus(SUCCESS)
      .setData(data)
      .setMeta(meta)
      .build();
  }

  static successWithoutMeta(data: object): ResponseDataApi {
    return ResponseDataApi.builder().setStatus(SUCCESS).setData(data).build();
  }

  static successWithoutDataAndMeta(): ResponseDataApi {
    return ResponseDataApi.builder().setStatus(SUCCESS).build();
  }

  static failure(error: object): ResponseDataApi {
    return ResponseDataApi.builder().setStatus(FAILURE).setError(error).build();
  }

  static builder(): ResponseDataApiBuilder {
    return new ResponseDataApiBuilder();
  }
}

export class ResponseDataApiBuilder {
  private readonly response: ResponseDataApi;

  constructor() {
    this.response = new ResponseDataApi();
  }

  setStatus(status: string): this {
    this.response.status = status;
    return this;
  }

  setData(data: object): this {
    this.response.data = data;
    return this;
  }

  setError(error: object): this {
    this.response.error = error;
    return this;
  }

  setMeta(meta: object): this {
    this.response.meta = meta;
    return this;
  }

  build(): ResponseDataApi {
    return this.response;
  }
}
