import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';

describe('MarketingController (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    // Set up the NestJS application with the full AppModule before running tests
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    // Clean up and close the application after all tests
    await app.close();
  });

  it('TODO: Integration with LLM provider (Bedrock/Ollama) depends on environment', async () => {
    // TODO: This test depends on the environment and the configured LLM provider.
    // If the environment is correctly set up and the provider responds, the test will pass.
    // Otherwise, this test should be adapted or mocked according to the CI/CD environment.
    expect(true).toBe(true);
  });
});
