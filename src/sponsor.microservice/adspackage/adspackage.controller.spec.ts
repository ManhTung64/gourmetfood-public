import { Test, TestingModule } from '@nestjs/testing';
import { AdspackageController } from './adspackage.controller';

describe('AdspackageController', () => {
  let controller: AdspackageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdspackageController],
    }).compile();

    controller = module.get<AdspackageController>(AdspackageController);
  });


});
