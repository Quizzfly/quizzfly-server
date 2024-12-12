import { PageOptionsDto } from '@common/dto/offset-pagination/page-options.dto';
import { RangeDateDto } from '@common/dto/range-date.dto';
import { EnumFieldOptional } from '@core/decorators/field.decorators';
import { IntersectionType, PickType } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

enum RoomSortProperty {
  START_TIME = 'start_time',
  END_TIME = 'end_time',
  ROOM_STATUS = 'room_status',
  PARTICIPANT_COUNT = 'participant_count',
  CREATED_AT = 'created_at',
  UPDATED_AT = 'updated_at',
}

@Expose()
export class FilterRoomReqDto extends IntersectionType(
  RangeDateDto,
  PickType(PageOptionsDto, ['page', 'limit', 'order']),
) {
  @EnumFieldOptional(() => RoomSortProperty, {
    default: RoomSortProperty.CREATED_AT,
    name: 'sort_by',
  })
  @Expose({ name: 'sort_by' })
  readonly sortBy: RoomSortProperty;
}
