import { Test, TestingModule } from '@nestjs/testing';
import { FootPrintsController } from './foot-prints.controller';
import { FootPrintsService } from './foot-prints.service';

describe('FootPrintsController', () => {
  let controller: FootPrintsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FootPrintsController],
      providers: [FootPrintsService],
    }).compile();

    controller = module.get<FootPrintsController>(FootPrintsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
