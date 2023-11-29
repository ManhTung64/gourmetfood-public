import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IUser } from '../user/user.model';

@Injectable()
export class AuthService {
    constructor(private readonly service:JwtService){

    }
    public async createToken (account:IUser):Promise<string>{
        const tokenData:any = {
            accountId: account._id,
            username: account.username,
            name: account.name,
            role:account.role,
            verify:account.verify
        }
        if (account.email) {
            tokenData['email'] = account.email;
        }
        return await this.service.signAsync(tokenData)
    }
}
