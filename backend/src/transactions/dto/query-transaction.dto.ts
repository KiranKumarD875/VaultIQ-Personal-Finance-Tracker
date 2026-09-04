import { IsOptional, IsDateString, IsIn, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryTransactionDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsIn(['EXPENSE', 'INCOME'])
  type?: 'EXPENSE' | 'INCOME';

  @IsOptional()
  category_id?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number;
}