import { Request, Response, NextFunction } from 'express';
import { DonorsService } from './donors.service';
import { success, paginated } from '@shared/utils/response.util';

export class DonorsController {
  constructor(private readonly donorsService: DonorsService) {}

  createProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const profile = await this.donorsService.createProfile(req.user!.id, req.body as Parameters<DonorsService['createProfile']>[1]);
      res.status(201).json(success(profile));
    } catch (err) { next(err); }
  };

  getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const profile = await this.donorsService.getProfile(req.user!.id);
      res.json(success(profile));
    } catch (err) { next(err); }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const profile = await this.donorsService.updateProfile(req.user!.id, req.body as Parameters<DonorsService['updateProfile']>[1]);
      res.json(success(profile));
    } catch (err) { next(err); }
  };

  getEligibility = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const eligibility = await this.donorsService.getEligibility(req.user!.id);
      res.json(success(eligibility));
    } catch (err) { next(err); }
  };

  findNearby = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const q = req.query as Record<string, string>;
      const result = await this.donorsService.findNearby({
        lat:       Number(q.lat),
        lon:       Number(q.lon),
        radiusKm:  Number(q.radiusKm ?? 10),
        bloodType: q.bloodType,
        page:      Number(q.page ?? 1),
        limit:     Number(q.limit ?? 20),
      });
      res.json(paginated(result.donors, result.total, Number(q.page ?? 1), Number(q.limit ?? 20)));
    } catch (err) { next(err); }
  };
}
