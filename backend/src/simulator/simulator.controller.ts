import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { SimulatorService } from './simulator.service';
import { CreateSimulatorScenarioDto } from './dto/create-simulator-scenario.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('simulator')
export class SimulatorController {
  constructor(private readonly simulatorService: SimulatorService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateSimulatorScenarioDto) {
    return this.simulatorService.create(user.userId, dto);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.simulatorService.findAll(user.userId);
  }

  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.simulatorService.remove(id, user.userId);
  }
}
