import { Body, Controller, Get, HttpCode, Post, UnauthorizedException } from '@nestjs/common';
import { CurrentUser, Public, SignInService } from '@nestjs/authentication';
import { Throttle } from '@nestjs/throttler';
import type { AdminIdentity } from './admin-identity.js';
import { AdminUsersService } from './admin-users.service.js';
import { changePasswordSchema, signInSchema, type ChangePassword, type SignIn } from './auth.schemas.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly users: AdminUsersService,
    private readonly signInService: SignInService,
  ) {}

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('sign-in')
  @HttpCode(200)
  async signIn(@Body({ schema: signInSchema }) body: SignIn) {
    const user = await this.users.verify(body.email, body.password);
    if (!user) throw new UnauthorizedException('Invalid email or password');
    await this.signInService.signIn(user.id, { method: 'password' }); // sets the session cookie
    return { user };
  }

  @Post('sign-out')
  @HttpCode(204)
  async signOut() {
    await this.signInService.signOut();
  }

  @Get('me')
  me(@CurrentUser() user: AdminIdentity) {
    return { user };
  }

  @Post('password')
  @HttpCode(204)
  async changePassword(@CurrentUser() user: AdminIdentity, @Body({ schema: changePasswordSchema }) body: ChangePassword) {
    await this.users.changePassword(user.id, body.current, body.next);
  }
}
