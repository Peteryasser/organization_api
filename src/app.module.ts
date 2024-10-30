import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt';
import config from './config/config';
import { RedisModule, RedisModuleOptions } from '@liaoliaots/nestjs-redis';
import { OrganizationModule } from './organization/organization.module';
import { RoleModule } from './role/role.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [config],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config) => ({
        secret: config.get('jwt.secret'),
      }),
      global: true,
      inject: [ConfigService],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config) => ({
        uri: config.get('database.connectionString'),
      }),
      inject: [ConfigService],
    }),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService): Promise<RedisModuleOptions> => {

        return {
          config: {
            url: config.get('redis.url'),
            host: config.get('redis.host'),
            port: config.get('redis.port'),
            password: config.get('redis.password')
          }
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    OrganizationModule,
    RoleModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
