import { Request, Response, NextFunction } from 'express';
import { AdminService } from './admin.service';
import { success, paginated } from '@shared/utils/response.util';

export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  getDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { res.json(success(await this.adminService.getDashboard())); } catch (err) { next(err); }
  };

  listUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const q = req.query as Record<string, string>;
      const { users, total } = await this.adminService.listUsers({
        role: q.role, search: q.search,
        isActive: q.isActive !== undefined ? q.isActive === 'true' : undefined,
        page: Number(q.page ?? 1), limit: Number(q.limit ?? 20),
      });
      res.json(paginated(users, total, Number(q.page ?? 1), Number(q.limit ?? 20)));
    } catch (err) { next(err); }
  };

  updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.adminService.updateUser(req.params.id, req.body as { isActive?: boolean; role?: string });
      res.json(success(result));
    } catch (err) { next(err); }
  };

  listHospitals = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const q = req.query as Record<string, string>;
      const { hospitals, total } = await this.adminService.listHospitals({
        verificationStatus: q.verificationStatus, city: q.city,
        page: Number(q.page ?? 1), limit: Number(q.limit ?? 20),
      });
      res.json(paginated(hospitals, total, Number(q.page ?? 1), Number(q.limit ?? 20)));
    } catch (err) { next(err); }
  };

  createHospital = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.adminService.createHospital(req.body as Record<string, unknown>);
      res.status(201).json(success(result));
    } catch (err) { next(err); }
  };

  verifyHospital = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.adminService.verifyHospital(req.params.id, (req.body as { status: string }).status, req.user!.id);
      res.json(success(result));
    } catch (err) { next(err); }
  };

  getAuditLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const q = req.query as Record<string, string>;
      const { logs, total } = await this.adminService.getAuditLogs({
        actorId: q.actorId, action: q.action,
        page: Number(q.page ?? 1), limit: Number(q.limit ?? 20),
      });
      res.json(paginated(logs, total, Number(q.page ?? 1), Number(q.limit ?? 20)));
    } catch (err) { next(err); }
  };
}
