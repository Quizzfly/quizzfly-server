import { ApiPublic } from '@core/decorators/http.decorators';
import { Public } from '@core/decorators/public.decorator';
import { Controller, Get } from '@nestjs/common';
import * as crypto from 'node:crypto';

@Controller('/')
export class HomeController {
  @Get()
  @Public()
  @ApiPublic({ summary: 'Home' })
  home() {
    const secret = crypto.randomBytes(32).toString('hex');
    return 'Welcome to the API: ' + secret;
  }
}
