import { DonationsRepository } from './donations.repository';
import { DonorsRepository } from '@modules/donors/donors.repository';
import { NotFoundError, ForbiddenError } from '@shared/errors';
import type { DonationType } from '@shared/constants/cooldown.constants';

export class DonationsService {
  constructor(
    private readonly donationsRepo: DonationsRepository,
    private readonly donorsRepo: DonorsRepository,
  ) {}

  async logDonation(userId: string, data: {
    requestId?: string; hospitalId?: string; donationType: DonationType;
    unitsDonated: number; donatedAt: string; notes?: string;
  }) {
    const donorProfile = await this.donorsRepo.findByUserId(userId);
    if (!donorProfile) throw new NotFoundError('Donor profile');

    const donatedAt = new Date(data.donatedAt);
    if (donatedAt > new Date()) throw new ForbiddenError('donatedAt cannot be in the future');

    return this.donationsRepo.create({
      donorProfileId: donorProfile.id,
      requestId:      data.requestId,
      hospitalId:     data.hospitalId,
      donationType:   data.donationType,
      unitsDonated:   data.unitsDonated,
      donatedAt,
      notes:          data.notes,
    });
  }

  async getDonationHistory(userId: string, params: { page: number; limit: number }) {
    const donorProfile = await this.donorsRepo.findByUserId(userId);
    if (!donorProfile) throw new NotFoundError('Donor profile');

    const offset = (params.page - 1) * params.limit;
    return this.donationsRepo.findByDonorProfile(donorProfile.id, { limit: params.limit, offset });
  }

  async getDonationById(userId: string, donationId: string) {
    const donorProfile = await this.donorsRepo.findByUserId(userId);
    if (!donorProfile) throw new NotFoundError('Donor profile');

    const donation = await this.donationsRepo.findById(donationId);
    if (!donation) throw new NotFoundError('Donation');
    if (donation.donor_id !== donorProfile.id) throw new ForbiddenError('Access denied');

    return donation;
  }
}
