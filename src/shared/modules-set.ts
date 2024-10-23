import appConfig from '@config/app.config';
import { AllConfigType } from '@config/config.type';
import { Environment } from '@core/constants/app.constant';
import loggerFactory from '@core/utils/logger-factory';
import databaseConfig from '@database/config/database.config';
import { TypeOrmConfigService } from '@database/typeorm-config.service';
import redisConfig from '@libs/redis/config/redis.config';
import mailConfig from '@mail/config/mail.config';
import { MailModule } from '@mail/mail.module';
import authConfig from '@modules/auth/config/auth.config';
import fileConfig from '@modules/file/config/file.config';
import { CacheModule } from '@nestjs/cache-manager';
import { ModuleMetadata } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { redisStore } from 'cache-manager-ioredis-yet';
import {
  AcceptLanguageResolver,
  HeaderResolver,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n';
import { LoggerModule } from 'nestjs-pino';
import path from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';
import { addTransactionalDataSource } from 'typeorm-transactional';

function generateModulesSet() {
  const imports: ModuleMetadata['imports'] = [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfig,
        databaseConfig,
        authConfig,
        mailConfig,
        fileConfig,
        redisConfig,
      ],
      envFilePath: ['.env'],
    }),
  ];
  let customModules: ModuleMetadata['imports'] = [];

  const dbModule = TypeOrmModule.forRootAsync({
    useClass: TypeOrmConfigService,
    dataSourceFactory: async (options: DataSourceOptions) => {
      if (!options) {
        throw new Error('Invalid options passed');
      }

      return addTransactionalDataSource(new DataSource(options));
    },
  });

  const i18nModule = I18nModule.forRootAsync({
    resolvers: [
      { use: QueryResolver, options: ['lang'] },
      AcceptLanguageResolver,
      new HeaderResolver(['x-lang']),
    ],
    useFactory: (configService: ConfigService<AllConfigType>) => {
      const env = configService.get('app.nodeEnv', { infer: true });
      const isLocal = env === Environment.LOCAL;
      const isDevelopment = env === Environment.DEVELOPMENT;
      return {
        fallbackLanguage: configService.getOrThrow('app.fallbackLanguage', {
          infer: true,
        }),
        loaderOptions: {
          path: path.join(__dirname, '/../i18n/'),
          watch: isLocal,
        },
        typesOutputPath: path.join(
          __dirname,
          '../../src/generated/i18n.generated.ts',
        ),
        logging: isLocal || isDevelopment, // log info on missing keys
      };
    },
    inject: [ConfigService],
  });

  const loggerModule = LoggerModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: loggerFactory,
  });

  const cacheModule = CacheModule.registerAsync({
    imports: [ConfigModule],
    useFactory: async (configService: ConfigService<AllConfigType>) => {
      return {
        store: await redisStore({
          host: configService.getOrThrow('redis.host', {
            infer: true,
          }),
          port: configService.getOrThrow('redis.port', {
            infer: true,
          }),
        }),
      };
    },
    isGlobal: true,
    inject: [ConfigService],
  });

  const modulesSet = process.env.MODULES_SET || 'monolith';

  switch (modulesSet) {
    case 'monolith':
      customModules = [
        dbModule,
        i18nModule,
        loggerModule,
        MailModule,
        cacheModule,
      ];
      break;
    case 'api':
      customModules = [
        dbModule,
        i18nModule,
        loggerModule,
        MailModule,
        cacheModule,
      ];
      break;
    default:
      console.error(`Unsupported modules set: ${modulesSet}`);
      break;
  }

  return imports.concat(customModules);
}

export default generateModulesSet;
