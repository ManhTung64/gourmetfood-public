import { Test, TestingModule } from '@nestjs/testing';
import { CommentController } from './comment.controller';

describe('CommentController', () => {
  let controller: CommentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentController],
    }).compile();

    controller = module.get<CommentController>(CommentController);
  });


});
