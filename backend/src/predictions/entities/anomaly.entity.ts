import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('anomalies')
export class Anomaly {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column({ nullable: true })
  transaction_id: string;

  @Column({ nullable: true })
  reason: string;

  @Column({ default: 'MEDIUM' })
  severity: string;

  @CreateDateColumn()
  detected_at: Date;
}