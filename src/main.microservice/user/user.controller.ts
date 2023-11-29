import { Controller, Get, Post, Body, Res, Req, UseGuards, HttpStatus, UploadedFiles, UploadedFile, UseInterceptors, Patch, ValidationPipe, Param } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';
import { Request, Response } from 'express';
import { UserVerifyCode } from './user.interface';

import { LoginDto } from './dto/login.dto';
import { BaseUser, CreateUser, Role, Updateuser, changeEmailFirstStep, changeEmailSecondStep, changePasswordWithOldPassword, changePasswordWithoutOldPassword, createCode, verifyCode } from './dto/user.dto';
import { AdministratorService } from '../administrator/administrator.service';
import { AuthenticationGuard } from '../auth/auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { ConstValue } from '../../otherModule/shared/defaultValues';
import { IUser } from './user.model';
import { INotification } from './notification/notification.model';
import { RolesGuard } from '../auth/role.guard';
import { Roles } from '../auth/role.decorator';

@Controller('api')
export class UserController {
  private emailRegex: RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  private VerifyCodeState: Array<UserVerifyCode> = []
  constructor(protected readonly service: UserService, 
    private readonly adminService: AdministratorService,
    private readonly value:ConstValue) {
  }
  @Post('auth/login')
  public async loginNormal(@Body() body: LoginDto, @Res() res: Response) {
    try {
      const account: IUser | boolean | null = await this.service.checkInforAndPassword(body.username, body.password, this.emailRegex.test(body.username))
      if (!account || typeof account === 'boolean') {
        return res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: "Invalid account's information" })
      }
      else if (!account.verify) return res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: "This account is not verify email or disabled by admin" })
      else {
        const token:string = await this.service.createNewToken(account)
        
        return res.status(HttpStatus.OK).json({ success: true, message: "Login successful", token, account })
      }
    }
    catch (error) {
      console.log(error)
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal server error" })
    }
  }
  @Post('auth/create')
  public async createNormalAccount(@Body() account: CreateUser, @Res() res: Response) {
    try {
      if (account.password != account.rePassword) return res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: "Password and Re-password are not same" })
      else if (await this.service.checkExistedAccount(account.username, account.email) == this.value.NotExisted()) {
        if (await this.service.addNewNormalAccount(account) == this.value.Success()) {
          if (!await this.service.createCodeToVerifyAccount(account.email)) return res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: 'Create code failed' })
          const user: IUser | null = await this.service.FindAccountByEmail(account.email)
          
          if (user) return res.status(HttpStatus.OK).json({ success: true, user, message: "Create account successful" })
          else return res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: "Server error" })
        } else return res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: "Create failed" })
      }
      else return res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: "Username or email address is exsisted" })
    }
    catch (error) {
      console.log(error)
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal server error" })
    }
  }

  @Post('auth/createCode')
  public async createCodeToChangePassword(@Body() email: createCode, @Res() res: Response) {
    if (await this.service.isAppAccount(email.email, '') == this.value.NotExisted())
      return res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: 'This account is not existed or cannot create code' })

    if (!await this.service.createCodeToChangePassword(email.email)) return res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: 'Create code failed' })
    else return res.status(HttpStatus.OK).json({ success: true, message: 'Create code successful' })
  }

  @Post('auth/verifyCode')
  public async checkCode(@Body() body: verifyCode, @Res() res: Response) {
    try {
      if (this.service.checkCode(body.email, body.code)) {
        const userVerifyCode: string | null = await this.service.FindIdBaseEmail(body.email)
        if (userVerifyCode) {
          const existedUser: number | null = this.service.FindIndexOfArray(this.VerifyCodeState, userVerifyCode)
          if (existedUser == null) this.VerifyCodeState.push({ _id: userVerifyCode, allow: true })
          else this.VerifyCodeState[existedUser].allow = true
        }
        if (!body.cfMail || (body.cfMail && await this.service.verifyAccount(body.email))) return res.status(HttpStatus.OK).json({ success: true, message: "Code is true" })
        else return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: "Server error" })
      } else return res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: "Expired or invalid code" })
    } catch (error) {
      console.log(error)
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal server error" })
    }
  }
  @Post('auth/forgetPassword')
  public async changePasswordWithoutOldPassword(@Body() body: changePasswordWithoutOldPassword, @Res() res: Response) {
    try {
      const validAccount: number | null = this.service.FindIndexOfArray(this.VerifyCodeState, body._id)
      if (validAccount == null || this.VerifyCodeState[validAccount].allow == false) return res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: 'This account is not verify code' })
      else if (body.password != body.rePassword) return res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: "Password and Re-password are not same" })
      else if (await this.service.changePasswordWithId(body.password, body._id) == this.value.Fail()) res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: "Change password fail" })
      else {
        this.VerifyCodeState[validAccount].allow = false
        return res.status(HttpStatus.OK).json({ success: true, message: "Change password successful" })
      }
    }
    catch (error) {
      console.log(error)
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal server error" })
    }
  }
  @Post('user/changePassword')
  @UseGuards(AuthenticationGuard, RolesGuard)
  public async changePasswordWithOldPassword(@Req() req:Request, @Body() body: changePasswordWithOldPassword, @Res() res: Response) {
    try {
      const user: IUser | boolean | null = await this.service.checkInforAndPassword(body.username, body.oldPassword, false)

      if (user == null || typeof user === "boolean") return res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: 'Old password is invalid' })
      else if (user.password == null) return res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: 'This account cannot change password' })

      if (body.password != body.rePassword) return res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: "Password and Re-password are not same" })
      else if (await this.service.changePasswordWithUsername(body.password, user.username) == this.value.Fail()) res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: "Change password fail" })
      else return res.status(HttpStatus.OK).json({ success: true, message: "Change password successful" })
    } catch (error) {
      console.log(error)
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal server error" })
    }
  }
  @UseGuards(AuthenticationGuard)
  @Patch('user/updateProfile')
  @UseInterceptors(FileInterceptor('file'))
  public async updateProfile(@Req() req:Request,@Body() body: Updateuser, @UploadedFile() file: Express.Multer.File, @Res() res: Response) {
    try {
      console.log(req['user'])
      if (!await this.service.FindAccountById(req['user'].accountId)) return res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: "Account is invalid" })
      if (file) body.avatar = await this.service.updateAvatar(file)
      const updateResult: IUser | null | boolean = await this.service.updateProfileById(body)
      return res.status(HttpStatus.OK).json({ success: true, data:updateResult, message: "Update successful" })
    } catch (error) {
      console.log(error)
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal server error" })
    }
  }
  @Post('user/changeEmailfirst')
  @UseGuards(AuthenticationGuard)
  public async changeEmailFirstStep(@Req() req:Request, @Body() body: changeEmailFirstStep, @Res() res: Response) {
    try {
      if (!await this.service.isAppAccount(body._id, body.oldEmail)) return res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: "This account is not ex or cannot change password" })
      else if (await this.service.FindAccountByEmail(body.email)) return res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: "New Email is existed" })
      const code = this.service.createCodeToVerifyAccount(body.oldEmail)
      return res.status(HttpStatus.OK).json({ success: true, code })
    } catch (error) {
      console.log(error)
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal server error" })
    }
  }
  @Post('user/changeEmailsecond')
  @UseGuards(AuthenticationGuard)
  public async changeEmailSecondStep(@Req() req:Request, @Body() body: changeEmailSecondStep, @Res() res: Response) {
    try {
      if (this.service.checkCode(body.oldEmail, body.code)) {
        const userVerifyCode: string | null = await this.service.FindIdBaseEmail(body.oldEmail)
        if (userVerifyCode) {
          if (await this.service.changeEmail(body._id, body.email)) return res.status(HttpStatus.OK).json({ success: false, message: "Change email successful" })
          else return res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: "Server error" })
        }
        else return res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: "Account not ex" })
      }
      else return res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: "Code is false" })
    } catch (error) {
      console.log(error)
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal server error" })
    }
  }
  @Get('auth/facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  async facebookLoginCallback(@Req() req: any, @Res() res: Response) {
    try {
      if (!req.user) return res.status(HttpStatus.BAD_REQUEST).json({ success: this.value.Fail(), message: "Login failed" })
      else {
    // console.log(req.user.photos[0])
        const appAccount: BaseUser = {
          username: req.user.id,
          avatar: req.user.photos[0].value,
          name: req.user.displayName,
          email: "",
          verify:true,
          role: Role.User,
          createAt:new Date()
        }
        const result: any = await this.service.processOfCreateAppAccount(appAccount)
        if (result.success !== this.value.Fail()) res.redirect(`http://localhost:3000?token=${result.token}`)
        else res.redirect(`http://localhost:3000?token=false`)
      }
    } catch (error) {
      console.log(error)
      res.redirect(`http://localhost:3000?token=false`)
    }
  }
  @Get('auth/google/callback')
  @UseGuards(AuthGuard('google'))
  async googleLoginCallback(@Req() req: any, @Res() res: Response) {
    try {
      if (!req.user) return res.status(HttpStatus.BAD_REQUEST).json({ success: this.value.Fail(), message: "Login failed" })
      else {
        const appAccount: BaseUser = {
          username: req.user.id,
          avatar: req.user.photos[0].value,
          name: req.user.displayName,
          verify:true,
          email: req.user.emails[0].value,
          role:'',
          createAt:new Date()
        }
        const result: any = await this.service.processOfCreateAppAccount(appAccount)
        if (result.success !== this.value.Fail()) res.redirect(`http://localhost:3000?token=${result.token}`)
        else res.redirect(`http://localhost:3000?token=false`)
        
      }
    } catch (error) {
      console.log(error)
      res.redirect(`http://localhost:3000?token=false`)
    }
  }
  @Get('auth/getinformation')
  @UseGuards(AuthenticationGuard)
  async getInformation(@Req() req:Request, @Res() res:Response){
    try{
      const user:IUser = this.service.FindAccountById(req['user'].accountId)
      return res.status(HttpStatus.OK).json({success:true, account:user})
    }catch(error){
      console.log(error)
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal server error" })
    }
  }

  @Get('user/notification')
  @UseGuards(AuthenticationGuard)
  async getNotification(@Req() req: Request, @Res() res: Response) {
    try {
        const result: INotification[] = await this.service.getNotification(req['user'].accountId)
        return res.status(HttpStatus.OK).json({ success: true, notifications:result})
      
    } catch (error) {
      console.log(error)
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal server error" })
    }
  }
  @Get('user/getfollowing')
  @UseGuards(AuthenticationGuard, RolesGuard)
  @Roles(Role.Sponsor,Role.User)
  async getFollowing(@Req() req: Request, @Res() res: Response) {
    try {
        const result: unknown = this.service.getFollowing(req['user'].accountId)
        console.log(result)
        return res.status(HttpStatus.OK).json({ success: true, following:result})
      
    } catch (error) {
      console.log(error)
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal server error" })
    }
  }
  // @Get('user/csquyenriengtu')
  // async getURL(@Req() req: Request, @Res() res: Response) {
  //   try {
  //     return res.render()
  //   } catch (error) {
  //     console.log(error)
  //     return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal server error" })
  //   }
  // }
}
