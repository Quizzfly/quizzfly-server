import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { PageOptionsDto } from './page-options.dto';

export class OffsetPaginationDto {
  @ApiProperty()
  @Expose()
  readonly limit: number;

  @ApiProperty({ name: 'current_page' })
  @Expose()
  readonly currentPage: number;

  @ApiProperty({ name: 'has_next_page' })
  @Expose()
  readonly hasNextPage?: boolean = false;

  @ApiProperty({ name: 'has_previous_page' })
  @Expose()
  readonly hasPreviousPage?: boolean = false;

  @ApiProperty({ name: 'total_records' })
  @Expose()
  readonly totalRecords: number;

  @ApiProperty({ name: 'total_pages' })
  @Expose()
  readonly totalPages: number;

  constructor(totalRecords: number, pageOptions: PageOptionsDto) {
    this.limit = pageOptions.limit;
    this.currentPage = pageOptions.page;
    this.totalPages =
      this.limit > 0 ? Math.ceil(totalRecords / pageOptions.limit) : 0;
    this.totalRecords = totalRecords;
    this.hasNextPage = this.currentPage < this.totalPages;
    this.hasPreviousPage =
      this.currentPage > 1 && this.currentPage - 1 < this.totalPages;
  }
}
