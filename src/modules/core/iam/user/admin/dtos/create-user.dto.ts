import { IsArray, IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

class ProfilePayloadDto {
  @IsOptional()
  @IsString()
  birthday?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  country_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  province_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  ward_id?: number;

  @IsOptional()
  @IsString()
  about?: string;
}

export class CreateUserDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsArray()
  role_ids?: number[];

  @IsOptional()
  @ValidateNested()
  @Type(() => ProfilePayloadDto)
  profile?: ProfilePayloadDto;
}


