import { IsNumber, IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateGoalDto {
  @IsString()
  name: string;

  @IsNumber()
  target_amount: number;

  @IsOptional()
  @IsDateString()
  target_date?: string;
}