import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('simulator_scenarios')
export class SimulatorScenario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column()
  name: string;

  @Column('numeric', { precision: 14, scale: 2 })
  amount: number;

  @Column({ type: 'date', name: 'event_date' })
  eventDate: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
