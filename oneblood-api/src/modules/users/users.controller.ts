import { Request, Response, NextFunction } from 'express';
import { UsersService } from './users.service';
import { success } from '@shared/utils/response.util';

export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.usersService.getMe(req.user!.id);
      res.json(success(user));
    } catch (err) { next(err); }
  };

  updateMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.usersService.updateMe(req.user!.id, req.body as { name?: string; phone?: string });
      res.json(success(user));
    } catch (err) { next(err); }
  };

  deleteMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.usersService.deleteMe(req.user!.id);
      res.status(204).send();
    } catch (err) { next(err); }
  };
}
