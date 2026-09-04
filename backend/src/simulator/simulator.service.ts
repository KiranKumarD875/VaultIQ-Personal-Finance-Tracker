import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SimulatorScenario } from './entities/simulator-scenario.entity';
import { CreateSimulatorScenarioDto } from './dto/create-simulator-scenario.dto';

@Injectable()
export class SimulatorService {
  constructor(
    @InjectRepository(SimulatorScenario)
    private readonly scenarioRepository: Repository<SimulatorScenario>,
  ) {}

  async create(userId: string, dto: CreateSimulatorScenarioDto): Promise<SimulatorScenario> {
    const scenario = this.scenarioRepository.create({
      userId,
      name: dto.name,
      amount: dto.amount,
      eventDate: dto.eventDate,
    });
    return this.scenarioRepository.save(scenario);
  }

  async findAll(userId: string): Promise<SimulatorScenario[]> {
    return this.scenarioRepository.find({
      where: { userId },
      order: { eventDate: 'ASC' },
    });
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.scenarioRepository.delete({ id, userId });
  }
}
