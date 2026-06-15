import { Request, Response, NextFunction } from 'express';
import { DonationsService } from './donations.service';
import { success, paginated } from '@shared/utils/response.util';

export class DonationsController {
  constructor(private readonly donationsService: DonationsService) {}

  log = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.donationsService.logDonation(req.user!.id, req.body as Parameters<DonationsService['logDonation']>[1]);
      res.status(201).json(success(result));
    } catch (err) { next(err); }
  };

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const q = req.query as Record<string, string>;
      const { donations, total } = await this.donationsService.getDonationHistory(req.user!.id, {
        page: Number(q.page ?? 1), limit: Number(q.limit ?? 20),
      });
      res.json(paginated(donations, total, Number(q.page ?? 1), Number(q.limit ?? 20)));
    } catch (err) { next(err); }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.donationsService.getDonationById(req.user!.id, req.params.id);
      res.json(success(result));
    } catch (err) { next(err); }
  };
}
