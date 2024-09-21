import { Test, TestingModule } from '@nestjs/testing';
import { CheerMailsRepliesService } from './cheer_mails_replies.service';

describe('CheerMailsRepliesService', () => {
  let service: CheerMailsRepliesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CheerMailsRepliesService],
    }).compile();

    service = module.get<CheerMailsRepliesService>(CheerMailsRepliesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
