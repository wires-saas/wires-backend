import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HttpModule } from '@nestjs/axios';
import { HealthCheckService, TerminusModule } from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';

const mockHealthCheckService = {
  check: jest.fn(),
};

const mockConfigService = {
  get: jest.fn(),
  getOrThrow: jest.fn(),
};

describe('HealthController', () => {
  let controller: HealthController;
  let healthCheckService: typeof mockHealthCheckService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule, TerminusModule],
      controllers: [HealthController],
      providers: [
        { provide: HealthCheckService, useValue: mockHealthCheckService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    healthCheckService =
      module.get<typeof mockHealthCheckService>(HealthCheckService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(healthCheckService).toBeDefined();
  });
});
