import { NotificationsRepository } from './notifications.repository';

export class NotificationsService {
  constructor(private readonly notificationsRepo: NotificationsRepository) {}

  async list(userId: string, params: { status?: string; type?: string; page: number; limit: number }) {
    const offset = (params.page - 1) * params.limit;
    return this.notificationsRepo.findByUser(userId, { ...params, offset });
  }

  async markRead(userId: string, id: string) {
    await this.notificationsRepo.markRead(id, userId);
    return { success: true };
  }

  async markAllRead(userId: string) {
    const updatedCount = await this.notificationsRepo.markAllRead(userId);
    return { updatedCount };
  }
}
