import {
    IsEmail,
    IsNotEmpty,
    IsString,
    Length,
    IsOptional,
  } from 'class-validator';
  import { ApiProperty } from '@nestjs/swagger';
  
  export class LoginDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @IsOptional()
    readonly altname: string;
  
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @Length(8)
    readonly password: string;
  }
  