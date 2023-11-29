import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { HttpStatus, forwardRef } from '@nestjs/common';
import { Response } from 'express';
import { JwtModule } from '@nestjs/jwt'; 
import { IUser, userSchema } from './user.model';
import { UserRepository } from './user.repository';
import { SharedModule } from '../../otherModule/shared/shared.module';
import { AdministratorModule } from '../administrator/administrator.module';
import { AuthModule } from '../auth/auth.module';
import { RecipeModule } from '../recipe/recipe.module';
import { RedisModule } from '../../otherModule/redis/redis.module';
import { MongooseModule } from '@nestjs/mongoose';
import { roleSchema } from './role/role.model';
import { followSchema } from './follow/follow.model';
import { notificationSchema } from './notification/notification.model';
import { RoleRepository } from './role/role.repository';
import { FollowRepository } from './follow/follow.repository';
import { NotificationRepository } from './notification/notification.repository';
import { FollowService } from './follow/follow.service';
import { NotificationService } from './notification/notification.service';
import { Schema, Types } from 'mongoose';

describe('UserController', () => {
  let controller: UserController;
  let service:UserService
  let repository:UserRepository

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      imports: [ JwtModule.register({ secret: 'aegsrdhgfnhioujk1h4524terd' }),
      MongooseModule.forRoot('mongodb+srv://manhtungyb10a10:qGAMpOvaJFwA7fvp@cluster0.wwhboi8.mongodb.net/test'),
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
      forwardRef(()=>SharedModule),
      forwardRef(()=>AdministratorModule),
      AuthModule,
      forwardRef(()=>RecipeModule),
      forwardRef(()=>RedisModule)
    ], 
    providers:[
      UserService,UserRepository, 
      RoleRepository, 
      FollowRepository,FollowService,
      NotificationRepository,
      NotificationService
  ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
    repository = module.get<UserRepository>(UserRepository);
  },20000);

  describe('loginNormal', () => {
    it('should return OK for a valid login', async () => {
      const validUsername = 'valid';
      const validPassword = 'valid';
      const validUser:any = {
        name: "Phuong Anh ",
        email: "abc2345@gmail.com",
        avatar: "https://webep.s3.ap-southeast-1.amazonaws.com/Avatar/87134809",
        username: "manhtung2",
        password: "$argon2id$v=19$m=65536,t=3,p=4$Q89z3K4eksW78COuT9xbWA$i5THZS5JrOn8QQoRDti1V/SiYXGc6MsSaIwpKMavqBg",
        dob: new Date(),
        gender: "Male",
        address: "hanoi",
        country: "VietNam",
        active: true,
        role:null,
        createAt: new Date(),
        verify: true
    }

      jest.spyOn(service, 'checkInforAndPassword').mockResolvedValue(validUser);

      jest.spyOn(service, 'createNewToken').mockResolvedValue('validToken');

      const responseMock: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.loginNormal({ username: validUsername, password: validPassword }, responseMock as Response);

      expect(responseMock.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(responseMock.json).toHaveBeenCalledWith({ success: true, message: "Login successful", token: 'validToken', account: validUser });

      expect(service.checkInforAndPassword).toHaveBeenCalledWith(validUsername, validPassword, expect.any(Boolean));
    });
    it('should return Bad request for a invalid login', async () => {
      const validUsername = 'invalid';
      const validPassword = 'valid';

      jest.spyOn(service, 'checkInforAndPassword').mockResolvedValue(null);

      const responseMock: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.loginNormal({ username: validUsername, password: validPassword }, responseMock as Response);

      expect(responseMock.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(responseMock.json).toHaveBeenCalledWith({ success: false, message: "Invalid account's information" });
    });
    it('should return Bad request for not verify email', async () => {
      const validUsername = 'valid';
      const validPassword = 'valid';
      const validUser:any = {
        name: "Phuong Anh ",
        email: "abc2345@gmail.com",
        avatar: "https://webep.s3.ap-southeast-1.amazonaws.com/Avatar/87134809",
        username: "manhtung2",
        password: "$argon2id$v=19$m=65536,t=3,p=4$Q89z3K4eksW78COuT9xbWA$i5THZS5JrOn8QQoRDti1V/SiYXGc6MsSaIwpKMavqBg",
        dob: new Date(),
        gender: "Male",
        address: "hanoi",
        country: "VietNam",
        active: true,
        role:null,
        createAt: new Date(),
        verify: false
    }
      jest.spyOn(service, 'checkInforAndPassword').mockResolvedValue(validUser);

      const responseMock: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.loginNormal({ username: validUsername, password: validPassword }, responseMock as Response);

      expect(responseMock.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(responseMock.json).toHaveBeenCalledWith({ success: false, message: "This account is not verify email or disabled by admin" });
    });
  });
});
