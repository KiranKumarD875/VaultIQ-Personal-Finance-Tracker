import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SimulatorService } from './simulator.service';
import { SimulatorController } from './simulator.controller';
import { SimulatorScenario } from './entities/simulator-scenario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SimulatorScenario])],
  controllers: [SimulatorController],
  providers: [SimulatorService],
})
export class SimulatorModule {}
