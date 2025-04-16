import { Module } from '@nestjs/common';
import { AuthModule } from 'apps/auth/src/auth.module';
import { ConfigModule } from '@nestjs/config';
import { DatasourceModule } from '@ds/datasource';
import { WaitlistModule } from './waitlist/waitlist.module';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env`,
      isGlobal: true,
    }),
    AuthModule,
    DatasourceModule,
    WaitlistModule,
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppModule {}