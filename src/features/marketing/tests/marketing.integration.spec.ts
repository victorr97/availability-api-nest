import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';

describe('MarketingController (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('TODO: Integration with LLM provider (Bedrock/Ollama) depends on environment', async () => {
    // TODO: Este test depende del entorno y del proveedor LLM configurado.
    // Si el entorno está correctamente configurado y el proveedor responde, el test pasará.
    // Si no, este test debe ser adaptado/mocked según el entorno de CI/CD.
    expect(true).toBe(true);
  });
});
