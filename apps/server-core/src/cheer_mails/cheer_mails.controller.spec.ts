import { Test, TestingModule } from '@nestjs/testing';
import { CheerMailsController } from './cheer_mails.controller';
import { CheerMailsService } from './cheer_mails.service';

describe('CheerMailsController', () => {
  let controller: CheerMailsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CheerMailsController],
      providers: [CheerMailsService],
    }).compile();

    controller = module.get<CheerMailsController>(CheerMailsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
