import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Availability API - Travel Marketplace')
    .setDescription(
      'This API provides endpoints to manage and retrieve availability data for a tourism marketplace. It includes features for availability tracking, forecasting trends, marketing insights, and dynamic pricing strategies. Use this documentation to explore and test the available endpoints.',
    )
    .setVersion('1.0.0')
    .addTag(
      'availability',
      'Endpoints for managing and retrieving availability data.',
    )
    .addTag(
      'forecasting',
      'Endpoints for analyzing and forecasting availability trends.',
    )
    .addTag(
      'marketing',
      'Endpoints for generating marketing insights and analytics.',
    )
    .addTag(
      'pricing',
      'Endpoints for managing and suggesting dynamic pricing strategies.',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [],
  });

  SwaggerModule.setup('api', app, document);
}
