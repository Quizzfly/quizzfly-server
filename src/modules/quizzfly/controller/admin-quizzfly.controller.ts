import { Uuid } from '@common/types/common.type';
import { ROLE } from '@core/constants/entity.enum';
import { ApiAuth } from '@core/decorators/http.decorators';
import { ValidateUuid } from '@core/decorators/validators/uuid-validator';
import { RolesGuard } from '@core/guards/role.guard';
import { AdminQueryQuizzflyReqDto } from '@modules/quizzfly/dto/request/admin-query-quizzfly.req.dto';
import { QuizzflyDetailResDto } from '@modules/quizzfly/dto/response/quizzfly-detail.res';
import { QuizzflyService } from '@modules/quizzfly/quizzfly.service';
import {
  Controller,
  Delete,
  Get,
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
export class AdminQuizzflyController {
  constructor(private readonly quizzflyService: QuizzflyService) {}

  @ApiAuth({
    summary: 'Get list quizzfly',
    roles: [ROLE.ADMIN],
    type: QuizzflyDetailResDto,
    isPaginated: true,
    paginationType: 'offset',
  })
  @UseGuards(RolesGuard)
  @Get()
  async getListQuizzfly(@Query() filterOptions: AdminQueryQuizzflyReqDto) {
    return await this.quizzflyService.getListQuizzfly(filterOptions);
  }

  @ApiAuth({
    summary: 'Delete quizzfly',
    roles: [ROLE.ADMIN],
  })
  @ApiParam({
    name: 'quizzflyId',
    description: 'The UUID of the Quizzfly',
    type: 'string',
  })
  @UseGuards(RolesGuard)
  @Delete(':quizzflyId')
  async deleteQuizzfly(@Param('quizzflyId', ValidateUuid) quizzflyId: Uuid) {
    return await this.quizzflyService.deleteQuizzfly(quizzflyId);
  }

  @ApiAuth({
    summary: 'Restore quizzfly',
    roles: [ROLE.ADMIN],
  })
  @ApiParam({
    name: 'quizzflyId',
    description: 'The UUID of the Quizzfly',
    type: 'string',
  })
  @UseGuards(RolesGuard)
  @Put(':quizzflyId/restore')
  async restoreQuizzfly(@Param('quizzflyId', ValidateUuid) quizzflyId: Uuid) {
    return await this.quizzflyService.restoreQuizzfly(quizzflyId);
  }

  @Patch(':quizzflyId/public')
  @ApiAuth({
    summary: 'Public quizzfly',
    roles: [ROLE.ADMIN],
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
    roles: [ROLE.ADMIN],
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
