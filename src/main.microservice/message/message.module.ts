import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MongooseModule } from '@nestjs/mongoose';
import { messageSchema } from './message.model';
import { MessageRepository } from './message.repository';
import { SharedModule } from '../../otherModule/shared/shared.module';
import { UserModule } from '../user/user.module';
import { MessageController } from './message.controller';

@Module({
  imports:[
    MongooseModule.forFeature([
      {name:'Message',schema:messageSchema}
    ]),
    SharedModule,
    UserModule
  ],
  providers: [MessageService, MessageRepository],
  exports: [MessageService, MessageRepository],
  controllers: [MessageController]
})
export class MessageModule {}
