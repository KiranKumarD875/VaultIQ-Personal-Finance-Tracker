import { IsNumber, IsString, IsIn, IsOptional, IsDateString, IsUUID } from 'class-validator';

export class CreateTransactionDto {
  @IsNumber()
  amount: number;

  @IsIn(['EXPENSE', 'INCOME'])
  type: 'EXPENSE' | 'INCOME';

  @IsOptional()
  @IsUUID()
  category_id?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  merchant?: string;

  @IsDateString()
  transaction_date: string;
}