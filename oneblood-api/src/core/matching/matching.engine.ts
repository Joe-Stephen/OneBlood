import { BloodType, BLOOD_COMPATIBILITY } from '@shared/constants/blood.constants';
import { DbClient } from '@infrastructure/database/db.client';
import { RedisCache } from '@infrastructure/redis/redis.cache';
import { RedisPubSub } from '@infrastructure/redis/redis.pubsub';

export interface MatchResult {
  donorProfileId: string;
  userId: string;
  donorName: string;
  bloodType: BloodType;
  distanceMeters: number;
}

export interface MatchEngineResult {
  requestId: string;
  donors: MatchResult[];
  radiusUsed: number;
}

const CHANNELS = {
  MATCH: 'notify:match',
  SOS:   'notify:sos',
};

export class MatchingEngine {
  constructor(
    private readonly db: DbClient,
    private readonly cache: RedisCache,
    private readonly pubsub: RedisPubSub,
  ) {}

  async run(
    requestId: string,
    bloodType: BloodType,
    urgencyLevel: 'NORMAL' | 'URGENT' | 'SOS',
    initialRadiusMeters: number,
    maxRadiusMeters: number,
  ): Promise<MatchEngineResult> {
    let radius = initialRadiusMeters;
    let donors = await this.findDonors(requestId, radius);

    // Expand radius if no donors found (one retry)
    if (donors.length === 0 && radius < maxRadiusMeters) {
      radius = maxRadiusMeters;
      donors = await this.findDonors(requestId, radius);
    }

    // Publish to notification service
    const channel = urgencyLevel === 'SOS' ? CHANNELS.SOS : CHANNELS.MATCH;
    await this.pubsub.publish(channel, {
      requestId,
      donorIds: donors.map(d => d.userId),
      urgencyLevel,
    });

    return { requestId, donors, radiusUsed: radius };
  }

  private async findDonors(requestId: string, radiusMeters: number): Promise<MatchResult[]> {
    const { rows } = await this.db.query<Record<string, unknown>>(
      'SELECT donor_profile_id, user_id, donor_name, blood_type, distance_meters FROM find_matching_donors($1, $2)',
      [requestId, radiusMeters],
    );
    return rows.map(r => ({
      donorProfileId: r['donor_profile_id'] as string,
      userId:         r['user_id'] as string,
      donorName:      r['donor_name'] as string,
      bloodType:      r['blood_type'] as BloodType,
      distanceMeters: Number(r['distance_meters']),
    }));
  }

  getCompatibleDonorTypes(recipientBloodType: BloodType): BloodType[] {
    return BLOOD_COMPATIBILITY[recipientBloodType] ?? [];
  }
}
