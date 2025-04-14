import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from 'libs/helpers/globalExceptionFilter';
import { ResponseInterceptor } from 'libs/inteceptors/response.interceptors';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
    const logger = new Logger('bootstrap');
  
  const app = await NestFactory.create(AuthModule);
   const configService = app.get<ConfigService>(ConfigService);
  
    app.setGlobalPrefix('api/v1/');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
  
    app.useGlobalFilters(new HttpExceptionFilter(configService));
    app.useGlobalInterceptors(new ResponseInterceptor());
  
    // setting up swagger documentation
    const config = new DocumentBuilder()
      .setTitle('Admin End API')
      .setDescription('Admin End APIs Documentation')
      .setVersion('1.0')
      .addTag('API')
      .build();
  
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/v1', app, document);
  
    const port = 5500;
    app.enableCors();
  
    await app.listen(port);
  
    logger.log(`auth-api application running to port: ${port}`);
}
bootstrap();
