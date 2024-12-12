import { CurrentUser } from '@core/decorators/current-user.decorator';
import { ApiAuth } from '@core/decorators/http.decorators';
import { ICurrentUser } from '@modules/auth/types/jwt-payload.type';
import { FilterRoomReqDto } from '@modules/room/dto/request/filter-room.req.dto';
import { RoomReportResDto } from '@modules/room/dto/response/room-report.res.dto';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ReportService } from './report.service';

@Controller({ version: '1', path: 'reports' })
@ApiTags('Reports API')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @ApiAuth({
    summary: 'Get list room for reports',
    isPaginated: true,
    paginationType: 'offset',
    type: RoomReportResDto,
  })
  @Get('rooms')
  getListRoomForReport(
    @CurrentUser() user: ICurrentUser,
    @Query() filter: FilterRoomReqDto,
  ) {
    return this.reportService.getListRoomForReport(user.id, filter);
  }
}
