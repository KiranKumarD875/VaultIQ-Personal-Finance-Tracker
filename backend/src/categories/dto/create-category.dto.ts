import { IsString, IsIn, IsOptional } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  name: string;

  @IsIn(['EXPENSE', 'INCOME'])
  type: 'EXPENSE' | 'INCOME';

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  color?: string;
}