import { Test, TestingModule } from '@nestjs/testing';
import { FootPrintsService } from './foot-prints.service';

describe('FootPrintsService', () => {
  let service: FootPrintsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FootPrintsService],
    }).compile();

    service = module.get<FootPrintsService>(FootPrintsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
