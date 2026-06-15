import { DbClient } from '@infrastructure/database/db.client';

export interface DonorProfileRow {
  id: string;
  user_id: string;
  blood_type: string;
  weight_kg: number;
  date_of_birth: string;
  city: string;
  state: string;
  availability_status: string;
  next_eligible_date: string | null;
  is_eligible: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateProfileData {
  userId: string;
  bloodType: string;
  weightKg: number;
  dateOfBirth: string;
  city: string;
  state: string;
  lat: number;
  lon: number;
}

export class DonorsRepository {
  constructor(private readonly db: DbClient) {}

  async create(data: CreateProfileData): Promise<DonorProfileRow> {
    const { rows } = await this.db.query<DonorProfileRow>(`
      INSERT INTO donor_profiles
        (user_id, blood_type, weight_kg, date_of_birth, city, state,
         location_point, availability_status, is_eligible, last_location_updated_at)
      VALUES ($1, $2, $3, $4, $5, $6,
              ST_MakePoint($7, $8)::GEOGRAPHY, 'ACTIVE', TRUE, NOW())
      RETURNING id, user_id, blood_type, weight_kg, date_of_birth, city, state,
                availability_status, next_eligible_date, is_eligible, created_at, updated_at
    `, [data.userId, data.bloodType, data.weightKg, data.dateOfBirth,
        data.city, data.state, data.lon, data.lat]);
    return rows[0];
  }

  async findByUserId(userId: string): Promise<DonorProfileRow | null> {
    const { rows } = await this.db.query<DonorProfileRow>(`
      SELECT id, user_id, blood_type, weight_kg, date_of_birth, city, state,
             availability_status, next_eligible_date, is_eligible, created_at, updated_at
      FROM donor_profiles WHERE user_id = $1
    `, [userId]);
    return rows[0] ?? null;
  }

  async findById(id: string): Promise<DonorProfileRow | null> {
    const { rows } = await this.db.query<DonorProfileRow>(`
      SELECT id, user_id, blood_type, weight_kg, date_of_birth, city, state,
             availability_status, next_eligible_date, is_eligible, created_at, updated_at
      FROM donor_profiles WHERE id = $1
    `, [id]);
    return rows[0] ?? null;
  }

  async update(id: string, data: Partial<{ weightKg: number; city: string; state: string; availabilityStatus: string; lat: number; lon: number }>): Promise<DonorProfileRow | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let i = 1;

    if (data.weightKg !== undefined)          { fields.push(`weight_kg = $${i++}`);             values.push(data.weightKg); }
    if (data.city !== undefined)              { fields.push(`city = $${i++}`);                   values.push(data.city); }
    if (data.state !== undefined)             { fields.push(`state = $${i++}`);                  values.push(data.state); }
    if (data.availabilityStatus !== undefined){ fields.push(`availability_status = $${i++}`);    values.push(data.availabilityStatus); }
    if (data.lat !== undefined && data.lon !== undefined) {
      fields.push(`location_point = ST_MakePoint($${i++}, $${i++})::GEOGRAPHY`);
      fields.push(`last_location_updated_at = NOW()`);
      values.push(data.lon, data.lat);
    }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    const { rows } = await this.db.query<DonorProfileRow>(`
      UPDATE donor_profiles SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${i}
      RETURNING id, user_id, blood_type, weight_kg, date_of_birth, city, state,
                availability_status, next_eligible_date, is_eligible, created_at, updated_at
    `, values);
    return rows[0] ?? null;
  }

  async findNearby(params: { lat: number; lon: number; radiusMeters: number; bloodType?: string; limit: number; offset: number }): Promise<{ donors: unknown[]; total: number }> {
    const bloodTypeFilter = params.bloodType ? `AND dp.blood_type = $5` : '';
    const queryParams: unknown[] = [params.lat, params.lon, params.radiusMeters, params.limit + params.offset];
    if (params.bloodType) queryParams.push(params.bloodType);

    const { rows } = await this.db.query(`
      SELECT
        dp.id AS donor_profile_id,
        u.name,
        dp.blood_type,
        ST_Distance(dp.location_point, ST_MakePoint($2, $1)::GEOGRAPHY) AS distance_meters,
        dp.availability_status
      FROM donor_profiles dp
      JOIN users u ON u.id = dp.user_id
      WHERE dp.availability_status = 'ACTIVE'
        AND dp.is_eligible = TRUE
        AND ST_DWithin(dp.location_point, ST_MakePoint($2, $1)::GEOGRAPHY, $3)
        ${bloodTypeFilter}
        AND u.deleted_at IS NULL
      ORDER BY distance_meters ASC
      LIMIT $4
    `, queryParams);

    const donors = rows.slice(params.offset, params.offset + params.limit);
    return { donors, total: rows.length };
  }
}
