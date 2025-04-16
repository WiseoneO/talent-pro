import { forwardRef, Module } from '@nestjs/common';
import { DatasourceService } from './datasource.service';
import { AuthModule } from 'apps/auth/src/auth.module';
import { WaitlistModule } from 'apps/talent-pro/src/waitlist/waitlist.module';

@Module({
  imports: [forwardRef(() => AuthModule)],
  providers: [DatasourceService],
  exports: [DatasourceService],
})
export class DatasourceModule {}
