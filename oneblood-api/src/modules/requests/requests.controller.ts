import { Request, Response, NextFunction } from 'express';
import { RequestsService } from './requests.service';
import { success, paginated } from '@shared/utils/response.util';

export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.requestsService.createRequest(req.user!.id, req.body as Parameters<RequestsService['createRequest']>[1]);
      res.status(201).json(success(result));
    } catch (err) { next(err); }
  };

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const q = req.query as Record<string, string>;
      const { requests, total } = await this.requestsService.listRequests({
        status:       q.status,
        bloodType:    q.bloodType,
        urgencyLevel: q.urgencyLevel,
        page:         Number(q.page ?? 1),
        limit:        Number(q.limit ?? 20),
      });
      res.json(paginated(requests, total, Number(q.page ?? 1), Number(q.limit ?? 20)));
    } catch (err) { next(err); }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.requestsService.getRequestById(req.params.id);
      res.json(success(result));
    } catch (err) { next(err); }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.requestsService.updateRequest(req.params.id, req.user!.id, req.body as { status?: string; notes?: string });
      res.json(success(result));
    } catch (err) { next(err); }
  };

  respond = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.requestsService.respondToRequest(
        req.params.id,
        req.user!.id,
        (req.body as { action: 'ACCEPTED' | 'DECLINED' }).action,
      );
      res.json(success(result));
    } catch (err) { next(err); }
  };
}
