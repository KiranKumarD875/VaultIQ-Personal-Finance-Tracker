import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  user_id: string;

  @Column()
  name: string;

  @Column()
  type: 'EXPENSE' | 'INCOME';

  @Column({ default: 'tag' })
  icon: string;

  @Column({ default: '#6366f1' })
  color: string;

  @Column({ default: false })
  is_default: boolean;

  @CreateDateColumn()
  created_at: Date;
}