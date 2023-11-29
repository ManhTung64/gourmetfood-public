import { Test, TestingModule } from '@nestjs/testing';
import { UserpackageController } from './userpackage.controller';

describe('UserpackageController', () => {
  let controller: UserpackageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserpackageController],
    }).compile();

    controller = module.get<UserpackageController>(UserpackageController);
  });


});
