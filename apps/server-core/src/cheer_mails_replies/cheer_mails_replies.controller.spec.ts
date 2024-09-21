import { Test, TestingModule } from '@nestjs/testing';
import { CheerMailsRepliesController } from './cheer_mails_replies.controller';
import { CheerMailsRepliesService } from './cheer_mails_replies.service';

describe('CheerMailsRepliesController', () => {
  let controller: CheerMailsRepliesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CheerMailsRepliesController],
      providers: [CheerMailsRepliesService],
    }).compile();

    controller = module.get<CheerMailsRepliesController>(CheerMailsRepliesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
