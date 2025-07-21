import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signup(@Body() signupData: AuthDto) {
    return this.authService.signup(signupData);
  }

  @Get('users')
  getUsers() {
    return this.authService.getUsers();
  }

  @Post('login')
  login(@Body() loginData: AuthDto) {
    return this.authService.login(loginData);
  }
}
