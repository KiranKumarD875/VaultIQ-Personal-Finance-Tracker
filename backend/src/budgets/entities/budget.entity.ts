import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Category } from '../../categories/entities/category.entity';

@Entity('budgets')
export class Budget {
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
  monthly_limit: number;

  @Column()
  month: number;

  @Column()
  year: number;

  @CreateDateColumn()
  created_at: Date;
}