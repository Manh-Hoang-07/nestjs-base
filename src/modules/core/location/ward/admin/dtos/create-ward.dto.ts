import { IsNotEmpty, IsOptional, IsString, MaxLength, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateWardDto {
    @IsNotEmpty()
    @Type(() => Number)
    @IsNumber()
    province_id: number;

    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    name: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    type: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(20)
    code: string;

    @IsOptional()
    @IsString()
    @MaxLength(30)
    status?: string;
}
