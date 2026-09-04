import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { TransactionsService } from '../transactions/transactions.service';
import { Anomaly } from './entities/anomaly.entity';
import { RecurringSubscription } from './entities/recurring-subscription.entity';
import { PredictionLog } from './entities/prediction-log.entity';

@Injectable()
export class PredictionsService {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
    private transactionsService: TransactionsService,
    @InjectRepository(Anomaly) private anomalyRepo: Repository<Anomaly>,
    @InjectRepository(RecurringSubscription) private recurringRepo: Repository<RecurringSubscription>,
    @InjectRepository(PredictionLog) private predictionLogRepo: Repository<PredictionLog>,
  ) {}

  private get aiUrl() {
    return this.configService.get<string>('aiServiceUrl');
  }

  async getExpensePrediction(userId: string, horizonDays = 30) {
    const history = await this.transactionsService.getHistoryForAI(userId, 180);

    if (history.length < 3) {
      return {
        predicted_amount: 0,
        confidence: 0,
        trend: 'insufficient_data',
        model_used: 'none',
        category_breakdown: {},
        daily_forecast: [],
        message: 'Add at least 3 transactions to unlock predictions.',
      };
    }

    const { data } = await firstValueFrom(
      this.httpService.post(`${this.aiUrl}/api/v1/predict/`, {
        history,
        horizon_days: horizonDays,
      }),
    );

    // fire-and-forget logging — never blocks the response
    this.predictionLogRepo
      .save(
        this.predictionLogRepo.create({
          user_id: userId,
          predicted_amount: data.predicted_amount,
          model_used: data.model_used,
          prediction_date: new Date().toISOString().split('T')[0],
        }),
      )
      .catch(() => undefined);

    return data;
  }

  async checkAnomaly(userId: string, newAmount: number, category?: string) {
    const history = await this.transactionsService.getHistoryForAI(userId, 180);

    if (history.length < 5) {
      return { is_anomaly: false, severity: 'NONE', reason: 'Not enough data yet.', z_score: 0 };
    }

    const { data } = await firstValueFrom(
      this.httpService.post(`${this.aiUrl}/api/v1/anomaly/`, {
        history,
        new_amount: newAmount,
        new_category: category,
      }),
    );
    return data;
  }

  async scanAnomalies(userId: string) {
    const history = await this.transactionsService.getHistoryWithIdsForAI(userId, 180);

    if (history.length < 4) {
      return [];
    }

    const { data } = await firstValueFrom(
      this.httpService.post(`${this.aiUrl}/api/v1/anomaly/scan`, { history }),
    );

    const flags = data.anomalies || [];

    for (const flag of flags) {
      const existing = await this.anomalyRepo.findOne({ where: { transaction_id: flag.id } });
      if (!existing) {
        await this.anomalyRepo.save(
          this.anomalyRepo.create({
            user_id: userId,
            transaction_id: flag.id,
            reason: flag.reason,
            severity: flag.severity,
          }),
        );
      }
    }

    return flags;
  }

  async getRecurringSubscriptions(userId: string) {
    const result = await this.transactionsService.findAll(userId, {} as any);
    const transactions = Array.isArray(result) ? result : result.data;

    const payload = transactions.map((t) => ({
      id: t.id,
      merchant: t.merchant,
      description: t.description,
      amount: Number(t.amount),
      date: t.transaction_date,
    }));

    if (payload.length < 2) {
      return [];
    }

    const { data } = await firstValueFrom(
      this.httpService.post(`${this.aiUrl}/api/v1/recurring/`, { transactions: payload }),
    );

    const subscriptions = data.subscriptions || [];

    for (const sub of subscriptions) {
      const existing = await this.recurringRepo.findOne({
        where: { user_id: userId, merchant_name: sub.merchant },
      });

      if (existing) {
        existing.avg_amount = sub.avg_amount;
        existing.frequency_days = sub.frequency_days;
        existing.last_seen_date = sub.last_seen;
        await this.recurringRepo.save(existing);
      } else {
        await this.recurringRepo.save(
          this.recurringRepo.create({
            user_id: userId,
            merchant_name: sub.merchant,
            avg_amount: sub.avg_amount,
            frequency_days: sub.frequency_days,
            last_seen_date: sub.last_seen,
          }),
        );
      }
    }

    return subscriptions;
  }

  async categorizeText(description: string) {
    const { data } = await firstValueFrom(
      this.httpService.post(`${this.aiUrl}/api/v1/categorize/`, { description }),
    );
    return data;
  }
}