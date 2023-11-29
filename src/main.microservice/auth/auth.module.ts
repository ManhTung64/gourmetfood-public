import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { AuthenticationGuard } from './auth.guard';

@Module({
  imports:[
    ConfigModule,
    JwtModule.register({
      global: true,
      secret: process.env.ACCESS_TOKEN_SECRET,
      signOptions: { expiresIn: '30d' },
    }),
  ],
  providers: [AuthService,AuthenticationGuard],
  exports:[AuthService, AuthenticationGuard]
})
export class AuthModule {}
