import { JwtUtil } from '@core/utils/jwt.util';
import { Global, Module, Provider } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

const providers: Provider[] = [JwtUtil];

@Global()
@Module({
  imports: [JwtModule.register({})],
  providers,
  exports: providers,
})
export class CoreModule {}
