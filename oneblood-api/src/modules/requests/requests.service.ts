import { RequestsRepository } from './requests.repository';
import { DonorsRepository } from '@modules/donors/donors.repository';
import { MatchingEngine } from '@core/matching/matching.engine';
import { SEARCH_RADIUS_METERS } from '@shared/constants/radius.constants';
import { metersToKm, buildMapsLink } from '@shared/utils/geo.util';
import { NotFoundError, ForbiddenError } from '@shared/errors';
import type { BloodType } from '@shared/constants/blood.constants';

export class RequestsService {
  constructor(
    private readonly requestsRepo: RequestsRepository,
    private readonly donorsRepo: DonorsRepository,
    private readonly matchingEngine: MatchingEngine,
  ) {}

  async createRequest(userId: string, data: {
    bloodType: string; unitsRequired: number; hospitalName: string; hospitalId?: string;
    location: { lat: number; lon: number }; urgencyLevel: 'NORMAL' | 'URGENT' | 'SOS';
    contactName: string; contactPhone: string; notes?: string;
  }) {
    const request = await this.requestsRepo.create({
      requesterId:  userId,
      hospitalId:   data.hospitalId,
      bloodType:    data.bloodType,
      unitsRequired:data.unitsRequired,
      lat:          data.location.lat,
      lon:          data.location.lon,
      urgencyLevel: data.urgencyLevel,
      contactName:  data.contactName,
      contactPhone: data.contactPhone,
      notes:        data.notes,
    });

    // Async matching — don't block response
    const radius = SEARCH_RADIUS_METERS[data.urgencyLevel];
    this.matchingEngine.run(
      request.id,
      data.bloodType as BloodType,
      data.urgencyLevel,
      radius.initial,
      radius.max,
    ).catch(err => console.error('Matching engine error:', err));

    return request;
  }

  async listRequests(params: { status?: string; bloodType?: string; urgencyLevel?: string; page: number; limit: number }) {
    const offset = (params.page - 1) * params.limit;
    return this.requestsRepo.findMany({ ...params, offset });
  }

  async getRequestById(id: string) {
    const request = await this.requestsRepo.findById(id);
    if (!request) throw new NotFoundError('Blood request');

    const acceptedDonors = await this.requestsRepo.getAcceptedDonors(id);
    return {
      ...request,
      acceptedDonors: (acceptedDonors as Array<Record<string, unknown>>).map(d => ({
        ...d,
        distanceKm: metersToKm(Number(d.distance_meters)),
      })),
    };
  }

  async updateRequest(id: string, userId: string, data: { status?: string; notes?: string }) {
    const request = await this.requestsRepo.findById(id);
    if (!request) throw new NotFoundError('Blood request');
    if (request.requester_id !== userId) throw new ForbiddenError('Not the request owner');

    if (data.status) await this.requestsRepo.updateStatus(id, data.status);
    return this.requestsRepo.findById(id);
  }

  async respondToRequest(requestId: string, userId: string, action: 'ACCEPTED' | 'DECLINED') {
    const request = await this.requestsRepo.findById(requestId);
    if (!request) throw new NotFoundError('Blood request');
    if (request.status !== 'OPEN' && request.status !== 'PARTIALLY_MATCHED') {
      throw new ForbiddenError('Request is no longer accepting responses');
    }

    const donorProfile = await this.donorsRepo.findByUserId(userId);
    if (!donorProfile) throw new NotFoundError('Donor profile');
    if (!donorProfile.is_eligible) throw new ForbiddenError('Donor is not currently eligible');

    await this.requestsRepo.recordResponse(donorProfile.id, requestId, action);

    if (action === 'ACCEPTED') {
      return {
        message: 'You have accepted this request. Please proceed to the hospital.',
        hospital: {
          name:         request.contact_name,
          contactPhone: request.contact_phone,
          mapsLink:     buildMapsLink(0, 0), // Location privacy — coordinates not exposed
        },
      };
    }

    return { message: 'Response recorded.' };
  }
}
