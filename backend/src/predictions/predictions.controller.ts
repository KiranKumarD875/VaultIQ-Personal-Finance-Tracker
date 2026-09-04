import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PredictionsService } from './predictions.service';

@UseGuards(JwtAuthGuard)
@Controller('predictions')
export class PredictionsController {
  constructor(private predictionsService: PredictionsService) {}

  @Get('expense')
  getExpensePrediction(@CurrentUser() user: any, @Query('horizon') horizon?: string) {
    return this.predictionsService.getExpensePrediction(
      user.userId,
      horizon ? parseInt(horizon, 10) : 30,
    );
  }

  @Post('anomaly')
  checkAnomaly(
    @CurrentUser() user: any,
    @Body('amount') amount: number,
    @Body('category') category?: string,
  ) {
    return this.predictionsService.checkAnomaly(user.userId, amount, category);
  }

  @Get('anomalies')
  scanAnomalies(@CurrentUser() user: any) {
    return this.predictionsService.scanAnomalies(user.userId);
  }

  @Get('recurring')
  getRecurring(@CurrentUser() user: any) {
    return this.predictionsService.getRecurringSubscriptions(user.userId);
  }

  @Post('categorize')
  categorize(@Body('description') description: string) {
    return this.predictionsService.categorizeText(description);
  }
}