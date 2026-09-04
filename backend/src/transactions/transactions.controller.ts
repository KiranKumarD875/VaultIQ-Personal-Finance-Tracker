import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';

@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateTransactionDto) {
    return this.transactionsService.create(user.userId, dto);
  }

  @Get()
  findAll(@CurrentUser() user: any, @Query() query: QueryTransactionDto) {
    return this.transactionsService.findAll(user.userId, query);
  }

  @Get('summary')
  getSummary(
    @CurrentUser() user: any,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    const now = new Date();
    const m = month ? parseInt(month, 10) : now.getMonth() + 1;
    const y = year ? parseInt(year, 10) : now.getFullYear();
    return this.transactionsService.getSummary(user.userId, m, y);
  }

  @Get('daily-history')
  getDailyHistory(@CurrentUser() user: any, @Query('days') days?: string) {
    return this.transactionsService.getDailyHistory(user.userId, days ? parseInt(days, 10) : 90);
  }

  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.transactionsService.remove(user.userId, id);
  }
}