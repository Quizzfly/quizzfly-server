import { EventService } from '@core/events/event.service';
import { JwtUtil } from '@core/utils/jwt.util';
import { Global, Module, Provider } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { JwtModule } from '@nestjs/jwt';

const providers: Provider[] = [JwtUtil, EventService];

@Global()
@Module({
  imports: [JwtModule.register({}), EventEmitterModule.forRoot()],
  providers,
  exports: providers,
})
export class CoreModule {}
