import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsModule } from '../transactions/transactions.module';
import { PredictionsService } from './predictions.service';
import { PredictionsController } from './predictions.controller';
import { Anomaly } from './entities/anomaly.entity';
import { RecurringSubscription } from './entities/recurring-subscription.entity';
import { PredictionLog } from './entities/prediction-log.entity';

@Module({
  imports: [
    HttpModule,
    TransactionsModule,
    TypeOrmModule.forFeature([Anomaly, RecurringSubscription, PredictionLog]),
  ],
  providers: [PredictionsService],
  controllers: [PredictionsController],
})
export class PredictionsModule {}