import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/')
  @ApiOperation({
    summary: 'Login Users',
    description: `A user can login to access their account.`,
  })
  async create(@Body() payload: LoginDto) {
    return this.authService.login(payload);
  }
}
