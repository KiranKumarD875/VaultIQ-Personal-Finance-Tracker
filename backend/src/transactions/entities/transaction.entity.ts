import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Category } from '../../categories/entities/category.entity';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column({ nullable: true })
  category_id: string;

  @ManyToOne(() => Category, { eager: true, nullable: true })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column('numeric', { precision: 14, scale: 2 })
  amount: number;

  @Column()
  type: 'EXPENSE' | 'INCOME';

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  merchant: string;

  @Column({ type: 'date' })
  transaction_date: string;

  @Column({ default: false })
  is_recurring: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}