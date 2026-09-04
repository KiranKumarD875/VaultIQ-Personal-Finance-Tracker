import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateSimulatorScenarioDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  eventDate: string;
}
