import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

@Injectable()
export class facebookStrategy extends PassportStrategy(FacebookStrategy, 'facebook') {
  constructor() {
    super({
      clientID: process.env.FACEBOOK_ID || '',
      clientSecret: process.env.FACEBOOK_SECRET || '',
      callbackURL: process.env.FACEBOOK_API_CALLBACK || '',
      profileFields: ['id', 'displayName', 'photos', 'email', 'hometown', 'gender', 'birthday'],
    });
  }
  async validate(accessToken: string, refreshToken: string, profile: any) {
    return profile;
  }
}

@Injectable()
export class googleStrategy extends PassportStrategy(GoogleStrategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_ID || '',
      clientSecret: process.env.GOOGLE_SECRET || '',
      callbackURL: process.env.GOOGLE_API_CALLBACK || '',
      scope: ['profile', 'email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    return profile; 
  }
}
