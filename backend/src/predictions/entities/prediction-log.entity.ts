import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('prediction_logs')
export class PredictionLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column('numeric', { precision: 14, scale: 2 })
  predicted_amount: number;

  @Column({ nullable: true })
  category_id: string;

  @Column({ nullable: true })
  model_used: string;

  @Column({ type: 'date', nullable: true })
  prediction_date: string;

  @CreateDateColumn()
  created_at: Date;
}