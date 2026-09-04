import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category) private repo: Repository<Category>,
  ) {}

  async findAllForUser(userId: string) {
    const raw = await this.repo
      .createQueryBuilder('c')
      .where('c.user_id = :userId OR c.is_default = true', { userId })
      .orderBy('c.name', 'ASC')
      .getMany();
      
    // Deduplicate by name (in case a default and user category share a name, or defaults were seeded twice)
    const unique = [];
    const names = new Set();
    for (const cat of raw) {
      if (!names.has(cat.name)) {
        names.add(cat.name);
        unique.push(cat);
      }
    }
    return unique;
  }

  create(userId: string, dto: CreateCategoryDto) {
    const category = this.repo.create({ ...dto, user_id: userId, is_default: false });
    return this.repo.save(category);
  }

  findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  remove(id: string) {
    return this.repo.delete({ id });
  }
}