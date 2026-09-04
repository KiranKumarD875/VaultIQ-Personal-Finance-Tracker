import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('goals')
export class Goal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column()
  name: string;

  @Column('numeric', { precision: 14, scale: 2 })
  target_amount: number;

  @Column('numeric', { precision: 14, scale: 2, default: 0 })
  current_amount: number;

  @Column({ type: 'date', nullable: true })
  target_date: string;

  @Column({ default: 'ACTIVE' })
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

  @CreateDateColumn()
  created_at: Date;
}