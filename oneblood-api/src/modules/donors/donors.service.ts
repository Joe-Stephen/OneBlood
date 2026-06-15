import { DonorsRepository } from './donors.repository';
import { ConflictError, NotFoundError } from '@shared/errors';
import { metersToKm, kmToMeters } from '@shared/utils/geo.util';

export class DonorsService {
  constructor(private readonly donorsRepo: DonorsRepository) {}

  async createProfile(userId: string, data: {
    bloodType: string; weightKg: number; dateOfBirth: string;
    city: string; state: string; location: { lat: number; lon: number };
  }) {
    const existing = await this.donorsRepo.findByUserId(userId);
    if (existing) throw new ConflictError('Donor profile already exists');

    return this.donorsRepo.create({
      userId,
      bloodType:   data.bloodType,
      weightKg:    data.weightKg,
      dateOfBirth: data.dateOfBirth,
      city:        data.city,
      state:       data.state,
      lat:         data.location.lat,
      lon:         data.location.lon,
    });
  }

  async getProfile(userId: string) {
    const profile = await this.donorsRepo.findByUserId(userId);
    if (!profile) throw new NotFoundError('Donor profile');
    return profile;
  }

  async updateProfile(userId: string, data: Partial<{
    weightKg: number; city: string; state: string;
    availabilityStatus: string; location: { lat: number; lon: number };
  }>) {
    const profile = await this.donorsRepo.findByUserId(userId);
    if (!profile) throw new NotFoundError('Donor profile');

    return this.donorsRepo.update(profile.id, {
      ...data,
      lat: data.location?.lat,
      lon: data.location?.lon,
    });
  }

  async getEligibility(userId: string) {
    const profile = await this.donorsRepo.findByUserId(userId);
    if (!profile) throw new NotFoundError('Donor profile');

    let cooldownDaysRemaining = 0;
    if (profile.next_eligible_date) {
      const diff = new Date(profile.next_eligible_date).getTime() - Date.now();
      cooldownDaysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }

    return {
      isEligible:            profile.is_eligible,
      availabilityStatus:    profile.availability_status,
      nextEligibleDate:      profile.next_eligible_date,
      cooldownDaysRemaining,
    };
  }

  async findNearby(params: { lat: number; lon: number; radiusKm: number; bloodType?: string; page: number; limit: number }) {
    const radiusMeters = kmToMeters(params.radiusKm);
    const offset = (params.page - 1) * params.limit;

    const { donors, total } = await this.donorsRepo.findNearby({
      lat: params.lat,
      lon: params.lon,
      radiusMeters,
      bloodType: params.bloodType,
      limit: params.limit,
      offset,
    });

    return {
      donors: (donors as Array<Record<string, unknown>>).map(d => ({
        ...d,
        distanceKm: metersToKm(Number(d.distance_meters)),
      })),
      total,
    };
  }
}
