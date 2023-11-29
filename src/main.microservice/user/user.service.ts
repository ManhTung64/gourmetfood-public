import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { mailAction } from '../../otherModule/shared/mailAction';
import { codeAction } from '../../otherModule/shared/codeAction';
import { passwordAction } from '../../otherModule/shared/passwordAction';
import { Service } from '../../../base/base.service';
import { UpdateUser, UserVerifyCode } from './user.interface';
import { UploadFile } from '../file/dto/file.dto';
import { BaseUser, CreateUser, Role } from './dto/user.dto';
import { ConstValue } from '../../otherModule/shared/defaultValues';
import S3 from '../../otherModule/shared/s3.service';
import { AuthService } from '../auth/auth.service';
import { IUser } from './user.model';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import { join, resolve } from 'path'
import { RoleRepository } from './role/role.repository';
import { INotification } from './notification/notification.model';
import { NotificationRepository } from './notification/notification.repository';
import { FollowService } from './follow/follow.service';
import { IFollow } from './follow/follow.model';
import { CollectionService } from '../recipe/collection/collection.service';

@Injectable()
export class UserService extends Service {
    constructor(
        private readonly repository: UserRepository,
        private readonly mail: mailAction,
        private readonly listCode: codeAction,
        private readonly password: passwordAction,
        private readonly value: ConstValue,
        private readonly s3: S3,
        private readonly auth: AuthService,
        private readonly roleRepository:RoleRepository,
        private readonly notificationRepository:NotificationRepository,
        private readonly followService:FollowService,
        private readonly collectionService:CollectionService
    ) {
        super()
    }
    public checkExistedAccount = async (username: string | null, email: string): Promise<boolean> => {
        try {
            if (username == null && email == null) throw new Error('Missing username or email')
            if (username && email && this.repository.findAccountBaseUsernameAndEmail(username, email)) return this.value.Existed()
            else if (email && !username) {
                if (this.repository.findAccountBaseEmail(email)) return this.value.Existed()
            } else if (!email && username) {
                if (this.repository.findAccountBaseUsername(username)) return this.value.Existed()
            }
            return this.value.NotExisted()
        }
        catch (error) {
            console.log(error)
            return this.value.Fail()
        }
    }
    public isAppAccount = async (email: string, _id: string): Promise<boolean> => {
        try {
            let account: IUser | null = null
            if (!email && !_id) throw new Error('Missing information')
            else if (email) {
                account = this.repository.findAccountBaseEmail(email)
            } else if (_id) {
                account = this.repository.findById(_id)
            }
            if (account && account.password != null) return this.value.Valid()
            else return this.value.Invalid()
        } catch (error) {
            console.log(error)
            return this.value.Fail()
        }
    }
    public FindAccountById = (_id: string): IUser => {
        try {
            if (!_id) throw new Error('Missing Id')
            return this.repository.findById(_id)
        } catch (error) {
            console.log(error)
            return null
        }
    }
    public FindAccountByEmail = async (email: string): Promise<IUser | null> => {
        try {
            if (!email) throw new Error('Missing email')
            return await this.repository.findAccountBaseEmail(email)
        } catch (error) {
            console.log(error)
            return null
        }
    }
    public FindIdBaseEmail = async (email: string): Promise<string | null> => {
        try {
            if (!email) throw new Error("Missing information")
            const user: IUser = await this.repository.findAccountBaseEmail(email)
            if (user) return user._id.toString()
            else return null
        } catch (error) {
            console.log(error)
            return null
        }
    }
    public FindIndexOfArray = (array: Array<UserVerifyCode>, field: string): number | null => {
        try {
            let result: number = -1
            for (let i: number = 0; i < array.length; i++) {
                if (array[i]._id == field) {
                    result = i
                    break
                }
            }
            return (result >= 0) ? result : null
        } catch (error) {
            console.log(error)
            return null
        }
    }
    public addNewNormalAccount = async (account: CreateUser): Promise<boolean> => {
        try {

            if (account == null) throw new HttpException("Missing account information", HttpStatus.BAD_REQUEST)
            if (!account.avatar) account.avatar = this.s3.getDefaulAvatar()
            account.password = await this.password.hashPassword(account.password)
            account.role = this.roleRepository.findByRole("user")
            account.createAt = new Date()
            const success:IUser = await this.repository.addNew(account)
            if (success && await this.collectionService.addDefaultCollection(success._id.toString())) return this.value.Success()
            else return this.value.Fail()
        }
        catch (error) {
            console.log(error)
            return this.value.Fail()
        }
    }
    public checkInforAndPassword = async (loginInfo: string, password: string, isEmail: boolean): Promise<IUser | boolean | null> => {
        try {
            var account: IUser | null
            if (isEmail) account =this.repository.findAccountBaseEmail(loginInfo)
            else account = this.repository.findAccountBaseUsername(loginInfo)
            if (account) {
                if (await this.password.verifyPassword(account.password, password)) return account
            }
            return this.value.NotExisted()
        }
        catch (error) {
            console.log(error)
            return this.value.Fail()
        }
    }
    public async createNewToken(account: IUser): Promise<string> {
        return await this.auth.createToken(account)
    }
    public createCodeToChangePassword = async (email: string): Promise<string | boolean> => {
        try {
            if (!email) throw new Error('Missing email')
            const code = this.listCode.createCode()
            this.listCode.addCode(email, code)
            const path = resolve(join(__dirname, '../../../templateEmail.hbs'))
            const template = fs.readFileSync(path, 'utf-8');

            // Compile template bằng handlebars
            const compiledTemplate = handlebars.compile(template);

            // Thay thế biến $code trong template
            const html = compiledTemplate({ $code: code,$username:'You' });
            await this.mail.sendMail(email,'Code to change password', html)
            return code
        } catch (error) {
            console.log(error)
            return this.value.Fail()
        }

    }
    public createCodeToVerifyAccount = async (email: string): Promise<string | boolean> => {
        try {
            if (!email) throw new Error('Missing email')
            const code = this.listCode.createCode()
            this.listCode.addCode(email, code)
            await this.mail.sendMail(email, 'Verify mail', code)
            return code
        } catch (error) {
            console.log(error)
            await this.repository.deleteUserByEmail(email)
            return this.value.Fail()
        }
    }
    public checkCode = (email: string, code: string): boolean => {
        try {
            if (!email || !code) throw new Error('Missing email or code')
            if (this.listCode.verifyCode(code, email)) return true
            return false
        } catch (error) {
            console.log(error)
            return this.value.Fail()
        }
    }
    public changePasswordWithId = async (password: string, _id: string): Promise<boolean> => {
        try {
            if (!password || !_id) throw new Error('Missing information')
            if (await this.repository.changePasswordAtId(await this.password.hashPassword(password), _id)) return true
            return false
        }
        catch (error) {
            console.log(error)
            return this.value.Fail()
        }
    }
    public changePasswordWithUsername = async (password: string, username: string): Promise<boolean> => {
        try {
            if (!password || !username) throw new Error('Missing information')
            if (await this.repository.changePasswordAtUsername(await this.password.hashPassword(password), username)) {
                const user:IUser = this.repository.findAccountBaseUsername(username);
                this.mail.sendMail(user.email, 'Warning', 'This account has changed password')
                return true
            }
            return false
        } catch (error) {
            console.log(error)
            return this.value.Fail()
        }
    }
    public validatePassword = (password: string): boolean => {
        try {
            if (!password) throw new Error('Missing information')
            if (this.checkComplex(password)) return this.value.Success()
            return this.value.Fail()
        } catch (error) {
            console.log(error)
            return this.value.Fail()
        }

    }
    public validateUsername = (username: string): boolean => {
        try {
            if (!username) throw new Error('Missing information')
            if (username.length >= 8) return this.value.Success()
            else return this.value.Fail()
        } catch (error) {
            console.log(error)
            return this.value.Fail()
        }

    }
    public verifyAccount = async (_id: string, email?: string): Promise<boolean> => {
        try {
          if ((!_id && !email)) return null
          if (email) {
            if (await this.repository.verifyAccount(this.repository.findAccountBaseEmail(email)._id.toString())) return this.value.Success()
            else return this.value.Fail()
          }
          else if (_id && await this.repository.verifyAccount(_id)) return this.value.Success()
          else return this.value.Fail()
        } catch (error) {
          console.log(error)
          return this.value.Fail()
        }
      }
    private checkComplex(inputStr: string): boolean {
        try {
            const validateUpperCase = /[^A-Z]/
            const validateNumber = /[^0-9]/
            const validateSpecial = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/
            if (validateUpperCase.test(inputStr) && validateNumber.test(inputStr) && validateSpecial.test(inputStr) && inputStr.length >= 8) return true
            else return false
        } catch (error) {
            console.log(error)
            return this.value.Fail()
        }
    }
    public createAppAccount = async (userAc: BaseUser): Promise<boolean | IUser | null> => {
        try {
            const user: IUser | null | boolean = (userAc.email == null)?
            this.repository.findAccountBaseUsername(userAc.username):this.repository.findAccountBaseEmail(userAc.email)
            if (user) return user
            else {
                userAc.role = this.roleRepository.findByRole("user")
                const newUser:IUser = await this.repository.addNew(userAc)
                if (newUser && await this.collectionService.addDefaultCollection(newUser._id.toString())) return newUser
                else return this.value.Fail()
            }
        }
        catch (error) {
            console.log(error)
            return this.value.Fail()
        }
    }
    public processOfCreateAppAccount = async (appAccount: BaseUser): Promise<Object> => {
        try {
            const userHasId: IUser | boolean | null = await this.createAppAccount(appAccount)
            if (typeof userHasId == "object" && userHasId) {
                const token: string = await this.createNewToken(userHasId)
                return new Object({ success: true, userHasId, token })
            }
            else {
                return new Object({ success: false })
            }
        } catch (error) {
            console.log(error)
            return new Object({ success: false })
        }
    }
    public updateProfileById = async (updateInformation: UpdateUser): Promise<IUser | null | boolean> => {
        try {
            if (!updateInformation._id) throw new Error('Missing information')
            const updatedUser: IUser | null = await this.repository.updateProfileById(updateInformation)
            if (updatedUser) {
                updatedUser.password = ''
                return updatedUser
            }
            else return this.value.Fail()
        } catch (error) {
            console.log(error)
            return this.value.Fail()
        }
    }
    public updateAvatar = async (file: UploadFile): Promise<string> => {
        try {
            if (!file) throw new Error('Missing file')
            return await this.s3.UploadOneFile(file)
        } catch (error) {
            console.log(error)
            return ''
        }
    }
    public changeEmail = async (_id: string, email: string): Promise<boolean> => {
        try {
            if (!_id || !email) throw new Error('Missing information')
            return await this.repository.changeEmail(_id, email)
        } catch (error) {
            console.log(error)
            return this.value.Fail()
        }
    }
    public getNotification = async(_id:string):Promise<INotification[]>=>{
        try{
            return this.notificationRepository.getNotificationByUserId(_id)
        }catch (error) {
            console.log(error)
            return null
        }
    }
    public getFollowing = (_id:string):unknown=>{
        try{
            let listFollow:IFollow[] = this.followService.getFollowings(_id)
            if (listFollow.length == 0) return null
            let list:any = []
            listFollow.map((follow)=>{
                list.push({
                    following_id:follow.following_id,
                    follower_id:follow.follower_id,
                    _id:follow._id,
                    followingAvatar:"",
                    followingName:""
                })
            })
            
            for (let i = 0; i < list.length; i++){
                this.repository.getAll().map((user)=>{
                    if (list[i].following_id.toString() == user._id.toString()){
                        list[i].followingAvatar = user.avatar
                        list[i].followingName = user.name
                    }
                })
            }
            return list
        }catch (error) {
            console.log(error)
            return null
        }
    }
}
