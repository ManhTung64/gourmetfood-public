import { Module, forwardRef } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { userSchema } from './user.model';
import { UserRepository } from './user.repository';
import { AdministratorModule } from '../administrator/administrator.module';
import { SharedModule } from '../../otherModule/shared/shared.module';
import { AuthModule } from '../auth/auth.module';
import { RecipeModule } from '../recipe/recipe.module';
import { RedisModule } from '../../otherModule/redis/redis.module';
import { RoleRepository } from './role/role.repository';
import { roleSchema } from './role/role.model';
import { FollowRepository } from './follow/follow.repository';
import { followSchema } from './follow/follow.model';
import { FollowService } from './follow/follow.service';
import { notificationSchema } from './notification/notification.model';
import { NotificationRepository } from './notification/notification.repository';
import { NotificationService } from './notification/notification.service';
@Module({
    imports:[
        MongooseModule.forFeature([
            {
                name:'User',
                schema:userSchema
            },{
                name:'Role',
                schema:roleSchema
            },{
                name:'Follow',
                schema:followSchema
            },{
                name:'Notification',
                schema:notificationSchema
            }
        ]),
        forwardRef(()=>AdministratorModule),
        forwardRef(()=>SharedModule),
        forwardRef(()=>AuthModule),
        forwardRef(()=>RecipeModule),
        forwardRef(()=>RedisModule),
    ],
    controllers:[UserController],
    providers:[
        UserService,UserRepository, 
        RoleRepository, 
        FollowRepository,FollowService,
        NotificationRepository,
        NotificationService
    ],
    exports:[UserRepository, UserService,FollowService, NotificationRepository,NotificationService, FollowService]
})
export class UserModule {}
