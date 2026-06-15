import { UsersRepository } from './users.repository';
import { NotFoundError } from '@shared/errors';

export class UsersService {
  constructor(private readonly usersRepo: UsersRepository) {}

  async getMe(userId: string) {
    const user = await this.usersRepo.findById(userId);
    if (!user) throw new NotFoundError('User');
    return user;
  }

  async updateMe(userId: string, data: Partial<{ name: string; phone: string }>) {
    const user = await this.usersRepo.update(userId, data);
    if (!user) throw new NotFoundError('User');
    return user;
  }

  async deleteMe(userId: string): Promise<void> {
    await this.usersRepo.softDelete(userId);
  }
}
