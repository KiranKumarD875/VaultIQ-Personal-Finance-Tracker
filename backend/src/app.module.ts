import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './config/configuration';
import { RedisModule } from './common/redis/redis.module';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { TransactionsModule } from './transactions/transactions.module';
import { BudgetsModule } from './budgets/budgets.module';
import { GoalsModule } from './goals/goals.module';
import { PredictionsModule } from './predictions/predictions.module';
import { SimulatorModule } from './simulator/simulator.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('database.host'),
        port: config.get('database.port'),
        username: config.get('database.username'),
        password: config.get('database.password'),
        database: config.get('database.name'),
        autoLoadEntities: true,
        // database/init.sql is now the SINGLE source of truth for schema.
        // Previously this was `true`, which caused TypeORM and the raw SQL
        // script to both try to own the schema — a real conflict risk.
        synchronize: false,
      }),
    }),
    RedisModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    TransactionsModule,
    BudgetsModule,
    GoalsModule,
    PredictionsModule,
    SimulatorModule,
    ChatModule,
  ],
})
export class AppModule {}