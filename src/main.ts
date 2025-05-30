import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { setupSwagger } from '@config/swagger.config';
import { HttpExceptionFilter } from '@common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable Helmet for security headers
  app.use(helmet());

  // Disable the 'x-powered-by' header
  app.getHttpAdapter().getInstance().disable('x-powered-by');

  // Enable global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Register the global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Setup Swagger documentation
  setupSwagger(app);

  // Start the application
  await app.listen(3002);
  console.log('🚀 [Main] Server is running on http://localhost:3002');
  console.log(
    '📄 [Main] Swagger documentation is available at http://localhost:3002/api',
  );
}
bootstrap();
