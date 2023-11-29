import { Test, TestingModule } from '@nestjs/testing';
import { UserhealthController } from './userhealth.controller';

describe('UserhealthController', () => {
  let controller: UserhealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserhealthController],
    }).compile();

    controller = module.get<UserhealthController>(UserhealthController);
  });


});
