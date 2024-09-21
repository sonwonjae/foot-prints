import { Test, TestingModule } from '@nestjs/testing';
import { CheerMailsService } from './cheer_mails.service';

describe('CheerMailsService', () => {
  let service: CheerMailsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CheerMailsService],
    }).compile();

    service = module.get<CheerMailsService>(CheerMailsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
