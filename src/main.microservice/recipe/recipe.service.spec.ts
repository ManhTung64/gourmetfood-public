import { Test, TestingModule } from '@nestjs/testing';
import { RecipeService } from './recipe.service';

describe('RecipeService', () => {
  let service: RecipeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecipeService],
    }).compile();

    service = module.get<RecipeService>(RecipeService);
  });


});
