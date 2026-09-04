import { IsNumber, IsUUID, IsOptional } from 'class-validator';

export class CreateBudgetDto {
  @IsOptional()
  @IsUUID()
  category_id?: string;

  @IsNumber()
  monthly_limit: number;

  @IsNumber()
  month: number;

  @IsNumber()
  year: number;
}