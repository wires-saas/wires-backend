import { Controller, Get, Logger } from '@nestjs/common';
import {
  HealthCheckService,
  HttpHealthIndicator,
  HealthCheck,
  DiskHealthIndicator,
  MemoryHealthIndicator,
  MongooseHealthIndicator,
} from '@nestjs/terminus';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

@ApiTags('Miscellaneous')
@Controller('health')
export class HealthController {
  private logger: Logger = new Logger(HealthController.name);
  private readonly s3Url: string;

  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private readonly disk: DiskHealthIndicator,
    private memory: MemoryHealthIndicator,
    private db: MongooseHealthIndicator,
    private configService: ConfigService,
  ) {
    this.s3Url =
      this.configService.getOrThrow('S3_protocol') +
      this.configService.getOrThrow('S3_url') +
      ':' +
      this.configService.getOrThrow('S3_port') +
      '/minio/health/live';

    this.logger.log('S3 Health URL is ' + this.s3Url);
  }

  @Get()
  @ApiOperation({ summary: 'Check health status of the application' })
  @ApiOkResponse({ description: 'The Health Check is successful' })
  @HealthCheck()
  check() {
    return this.health.check([
      () =>
        this.http.responseCheck('s3', this.s3Url, (res) => {
          return res.status === 200;
        }),
      () =>
        this.disk.checkStorage('storage', {
          path: '/',
          thresholdPercent: 0.95,
        }),
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
      () => this.db.pingCheck('database'),
    ]);
  }
}
