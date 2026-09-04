import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('recurring_subscriptions')
export class RecurringSubscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column()
  merchant_name: string;

  @Column('numeric', { precision: 14, scale: 2 })
  avg_amount: number;

  @Column()
  frequency_days: number;

  @Column({ nullable: true })
  category_id: string;

  @Column({ type: 'date', nullable: true })
  last_seen_date: string;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;
}