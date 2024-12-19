import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ReportService } from './report.service';

@Controller({ version: '1', path: 'reports' })
@ApiTags('Reports API')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}
}
