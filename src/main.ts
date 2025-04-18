import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Travel Marketplace API')
    .setDescription(
      'Backend API for managing availability, forecasting, marketing insights, and dynamic pricing.',
    )
    .setVersion('1.0')
    .addTag('availability', 'Endpoints related to availability data')
    .addTag('forecasting', 'Endpoints for forecasting availability trends')
    .addTag('marketing', 'Endpoints for marketing insights')
    .addTag('pricing', 'Endpoints for dynamic pricing suggestions')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Start the application
  await app.listen(3002);
  console.log('🚀 Server is running on http://localhost:3002');
}
bootstrap();
