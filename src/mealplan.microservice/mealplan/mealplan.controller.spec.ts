import { Test, TestingModule } from '@nestjs/testing';
import { MealplanController } from './mealplan.controller';

describe('MealplanController', () => {
  let controller: MealplanController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MealplanController],
    }).compile();

    controller = module.get<MealplanController>(MealplanController);
  });


});
