import { forwardRef, Module } from '@nestjs/common';
import { WaitlistService } from './waitlist.service';
import { WaitlistController } from './waitlist.controller';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { DatasourceModule } from '@ds/datasource';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: async (config: ConfigService) => ({
        transport: {
          pool: true,
          host: config.get<string>('EMAIL_HOST'),
          port: parseInt(config.get<string>('EMAIL_PORT'), 10),
          secure:
            config.get<string>('NODE_ENV') === 'production' ? true : false,
          auth: {
            user: config.get<string>('EMAIL_USER'),
            pass: config.get<string>('EMAIL_PASS'),
          },
        },
        defaults: {
          from: `Allies ${config.get<string>('EMAIL_FROM')}`,
        },
        template: {
          dir: join(process.cwd(), 'src/mail/templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
    forwardRef(()=>DatasourceModule),
  ],
  providers: [WaitlistService],
  controllers: [WaitlistController],
  exports: [WaitlistService],
})
export class WaitlistModule {}
