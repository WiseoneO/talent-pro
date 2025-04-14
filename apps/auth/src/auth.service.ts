import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { DatasourceService } from '@ds/datasource';
// import { UsersService } from 'apps/aparte-api/src/users/users.service';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import APIFeatures from 'libs/apiFeature.utils';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: DatasourceService,
    // private userService: UsersService,
    private jwtService: JwtService,

  ) {}
  async login(payload: LoginDto): Promise<any> {
    const criteria = {
      OR: [{ email: payload.altname }, { username: payload.altname }],
    };

    // const user = await this.userService.getOne(criteria);

    // if (!user) {
    //   throw new NotFoundException('User not found.');
    // }

    // const isPasswordValid = await bcrypt.compare(payload.password, user.password);

    // if (!isPasswordValid) {
    //   throw new UnauthorizedException('Invalid email or password');
    // }

    // if (user.deleted === true) {
    //   throw new BadRequestException('User has been deleted');
    // }

    // const token = await APIFeatures.assignJwtToken(user, this.jwtService);
    // const { password: _, ...sanitizedUser } = user;
    
    // return { token, user: sanitizedUser };

  }

  sanitizeUser(user) {
    if (!user) return {};
    const { password, deleted, ...sanitizedUser } = user;
    return sanitizedUser;
  }
}
