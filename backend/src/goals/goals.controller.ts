import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { GoalsService } from './goals.service';
import { CreateGoalDto } from './dto/create-goal.dto';

@UseGuards(JwtAuthGuard)
@Controller('goals')
export class GoalsController {
  constructor(private goalsService: GoalsService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateGoalDto) {
    return this.goalsService.create(user.userId, dto);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.goalsService.findAll(user.userId);
  }

  @Patch(':id/contribute')
  contribute(@CurrentUser() user: any, @Param('id') id: string, @Body('amount') amount: number) {
    return this.goalsService.contribute(id, amount, user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.goalsService.remove(id);
  }
}