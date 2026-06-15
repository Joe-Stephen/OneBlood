import { Request, Response, NextFunction } from 'express';
import { NotificationsService } from './notifications.service';
import { success, paginated } from '@shared/utils/response.util';

export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const q = req.query as Record<string, string>;
      const { notifications, total, unreadCount } = await this.notificationsService.list(req.user!.id, {
        status: q.status, type: q.type,
        page: Number(q.page ?? 1), limit: Number(q.limit ?? 20),
      });
      res.json({
        ...paginated(notifications, total, Number(q.page ?? 1), Number(q.limit ?? 20)),
        unreadCount,
      });
    } catch (err) { next(err); }
  };

  markRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.notificationsService.markRead(req.user!.id, req.params.id);
      res.json(success(null));
    } catch (err) { next(err); }
  };

  markAllRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.notificationsService.markAllRead(req.user!.id);
      res.json(success(result));
    } catch (err) { next(err); }
  };
}
