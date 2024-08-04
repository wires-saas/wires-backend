import { TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TestUtils } from './shared/utils/test.utils';

describe('AppController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await TestUtils.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    });
  });

  describe('getHello', () => {
    it('should return "Hello World!"', () => {
      const appController = app.get(AppController);
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});
