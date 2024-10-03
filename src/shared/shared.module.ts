import { Global, Module, Provider } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtUtil } from '@shared/services/jwt.util';

const providers: Provider[] = [JwtUtil];

@Global()
@Module({
  imports: [JwtModule.register({})],
  providers,
  exports: providers,
})
export class SharedModule {}
