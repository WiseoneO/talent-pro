import { Module } from '@nestjs/common';
import { AdminApiController } from './admin-api.controller';
import { AdminApiService } from './admin-api.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
  }),],
  controllers: [AdminApiController],
  providers: [AdminApiService],
})
export class AdminApiModule {}
