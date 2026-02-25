import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCountryDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(10)
    code: string;

    @IsOptional()
    @IsString()
    @MaxLength(10)
    code_alpha3?: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    name: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    official_name?: string;

    @IsOptional()
    @IsString()
    @MaxLength(20)
    phone_code?: string;

    @IsOptional()
    @IsString()
    @MaxLength(20)
    currency_code?: string;

    @IsOptional()
    @IsString()
    @MaxLength(20)
    flag_emoji?: string;

    @IsOptional()
    @IsString()
    @MaxLength(30)
    status?: string;
}
