import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';

@UseGuards(JwtAuthGuard)
@Controller('budgets')
export class BudgetsController {
  constructor(private budgetsService: BudgetsService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateBudgetDto) {
    return this.budgetsService.create(user.userId, dto);
  }

  @Get()
  findAll(@CurrentUser() user: any, @Query('month') month?: string, @Query('year') year?: string) {
    return this.budgetsService.findAll(
      user.userId,
      month ? parseInt(month, 10) : undefined,
      year ? parseInt(year, 10) : undefined,
    );
  }

  @Patch(':id')
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() updateData: Partial<CreateBudgetDto>) {
    return this.budgetsService.update(id, updateData, user.userId);
  }

  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.budgetsService.remove(id, user.userId);
  }
}