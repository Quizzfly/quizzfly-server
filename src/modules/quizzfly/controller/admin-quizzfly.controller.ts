import { Uuid } from '@common/types/common.type';
import { ActionList, ResourceList } from '@core/constants/app.constant';
import { ApiAuth } from '@core/decorators/http.decorators';
import { ValidateUuid } from '@core/decorators/validators/uuid-validator';
import { PermissionGuard } from '@core/guards/permission.guard';
import { AdminQueryQuizzflyReqDto } from '@modules/quizzfly/dto/request/admin-query-quizzfly.req.dto';
import { QuizzflyDetailResDto } from '@modules/quizzfly/dto/response/quizzfly-detail.res';
import { QuizzflyService } from '@modules/quizzfly/quizzfly.service';
import {
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';

@ApiTags('Admin Quizzfly APIs')
@Controller({
  path: 'admin/quizzfly',
  version: '1',
})
@UseGuards(PermissionGuard)
export class AdminQuizzflyController {
  constructor(private readonly quizzflyService: QuizzflyService) {}

  @ApiAuth({
    summary: 'Get list quizzfly',
    type: QuizzflyDetailResDto,
    isPaginated: true,
    paginationType: 'offset',
    permissions: [
      { resource: ResourceList.QUIZZFLY, actions: [ActionList.READ_ALL] },
    ],
  })
  @Get()
  getListQuizzfly(@Query() filterOptions: AdminQueryQuizzflyReqDto) {
    return this.quizzflyService.getListQuizzfly(filterOptions);
  }

  @ApiAuth({
    summary: 'Delete quizzfly',
    statusCode: HttpStatus.NO_CONTENT,
    permissions: [
      { resource: ResourceList.QUIZZFLY, actions: [ActionList.DELETE] },
    ],
  })
  @ApiParam({
    name: 'quizzflyId',
    description: 'The UUID of the Quizzfly',
    type: 'string',
  })
  @Delete(':quizzflyId')
  async deleteQuizzfly(@Param('quizzflyId', ValidateUuid) quizzflyId: Uuid) {
    return await this.quizzflyService.deleteQuizzfly(quizzflyId);
  }

  @ApiAuth({
    summary: 'Restore quizzfly',
    permissions: [
      { resource: ResourceList.QUIZZFLY, actions: [ActionList.UPDATE_ANY] },
    ],
  })
  @ApiParam({
    name: 'quizzflyId',
    description: 'The UUID of the Quizzfly',
    type: 'string',
  })
  @Put(':quizzflyId/restore')
  async restoreQuizzfly(@Param('quizzflyId', ValidateUuid) quizzflyId: Uuid) {
    return await this.quizzflyService.restoreQuizzfly(quizzflyId);
  }

  @Patch(':quizzflyId/public')
  @ApiAuth({
    summary: 'Public quizzfly',
    permissions: [
      { resource: ResourceList.QUIZZFLY, actions: [ActionList.UPDATE_ANY] },
    ],
  })
  @ApiParam({
    name: 'quizzflyId',
    description: 'The UUID of the Quizzfly',
    type: 'string',
  })
  async publicQuizzfly(@Param('quizzflyId') quizzflyId: Uuid) {
    return this.quizzflyService.publicQuizzfly(quizzflyId);
  }

  @Patch(':quizzflyId/un-public')
  @ApiAuth({
    summary: 'Unpublic quizzfly',
    permissions: [
      { resource: ResourceList.QUIZZFLY, actions: [ActionList.UPDATE_ANY] },
    ],
  })
  @ApiParam({
    name: 'quizzflyId',
    description: 'The UUID of the Quizzfly',
    type: 'string',
  })
  async unpublicQuizzfly(@Param('quizzflyId') quizzflyId: Uuid) {
    return this.quizzflyService.unpublicQuizzfly(quizzflyId);
  }
}
