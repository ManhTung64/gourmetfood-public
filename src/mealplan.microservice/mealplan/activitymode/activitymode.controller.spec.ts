import { Test, TestingModule } from '@nestjs/testing';
import { ActivitymodeController } from './ActivitymodeController';

describe('ActivitymodeController', () => {
  let controller: ActivitymodeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActivitymodeController],
    }).compile();

    controller = module.get<ActivitymodeController>(ActivitymodeController);
  });


});
