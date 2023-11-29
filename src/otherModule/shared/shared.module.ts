import { Module } from '@nestjs/common';
import { codeAction } from './codeAction';
import { mailAction } from './mailAction';
import { passwordAction } from './passwordAction';
import S3 from './s3.service';
import { ConstValue } from './defaultValues';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule,
        JwtModule.register({
            global: true,
            secret: process.env.ACCESS_TOKEN_SECRET,
            signOptions: { expiresIn: '3600000s' },
        }),
    ],
    providers: [codeAction, mailAction, passwordAction, S3, ConstValue],
    exports: [codeAction, mailAction, passwordAction, S3, ConstValue]
})
export class SharedModule { }
