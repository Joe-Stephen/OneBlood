import { DbClient } from '@infrastructure/database/db.client';
import { REQUEST_EXPIRY_HOURS } from '@shared/constants/radius.constants';

export interface BloodRequestRow {
  id: string;
  requester_id: string;
  hospital_id: string | null;
  blood_type: string;
  units_required: number;
  units_fulfilled: number;
  urgency_level: string;
  status: string;
  contact_name: string;
  contact_phone: string;
  notes: string | null;
  expires_at: Date;
  fulfilled_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateRequestData {
  requesterId: string;
  hospitalId?: string;
  bloodType: string;
  unitsRequired: number;
  lat: number;
  lon: number;
  urgencyLevel: 'NORMAL' | 'URGENT' | 'SOS';
  contactName: string;
  contactPhone: string;
  notes?: string;
}

export class RequestsRepository {
  constructor(private readonly db: DbClient) {}

  async create(data: CreateRequestData): Promise<BloodRequestRow> {
    const expiryHours = REQUEST_EXPIRY_HOURS[data.urgencyLevel];
    const { rows } = await this.db.query<BloodRequestRow>(`
      INSERT INTO blood_requests
        (requester_id, hospital_id, blood_type, units_required, location_point,
         urgency_level, status, contact_name, contact_phone, notes, expires_at)
      VALUES ($1, $2, $3, $4, ST_MakePoint($5, $6)::GEOGRAPHY,
              $7, 'OPEN', $8, $9, $10, NOW() + INTERVAL '${expiryHours} hours')
      RETURNING *
    `, [data.requesterId, data.hospitalId ?? null, data.bloodType, data.unitsRequired,
        data.lon, data.lat, data.urgencyLevel, data.contactName, data.contactPhone, data.notes ?? null]);
    return rows[0];
  }

  async findById(id: string): Promise<BloodRequestRow | null> {
    const { rows } = await this.db.query<BloodRequestRow>(
      'SELECT * FROM blood_requests WHERE id = $1',
      [id],
    );
    return rows[0] ?? null;
  }

  async findMany(params: {
    status?: string; bloodType?: string; urgencyLevel?: string;
    limit: number; offset: number;
  }): Promise<{ requests: BloodRequestRow[]; total: number }> {
    const conditions: string[] = [];
    const values: unknown[] = [];
    let i = 1;

    if (params.status)       { conditions.push(`status = $${i++}`);        values.push(params.status); }
    if (params.bloodType)    { conditions.push(`blood_type = $${i++}`);    values.push(params.bloodType); }
    if (params.urgencyLevel) { conditions.push(`urgency_level = $${i++}`); values.push(params.urgencyLevel); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await this.db.query<{ count: string }>(`SELECT COUNT(*) FROM blood_requests ${where}`, values);
    const total = Number(countRes.rows[0]?.count ?? 0);

    values.push(params.limit, params.offset);
    const { rows } = await this.db.query<BloodRequestRow>(`
      SELECT * FROM blood_requests ${where}
      ORDER BY created_at DESC
      LIMIT $${i++} OFFSET $${i++}
    `, values);

    return { requests: rows, total };
  }

  async findByRequesterId(requesterId: string): Promise<BloodRequestRow[]> {
    const { rows } = await this.db.query<BloodRequestRow>(
      'SELECT * FROM blood_requests WHERE requester_id = $1 ORDER BY created_at DESC',
      [requesterId],
    );
    return rows;
  }

  async updateStatus(id: string, status: string): Promise<BloodRequestRow | null> {
    const { rows } = await this.db.query<BloodRequestRow>(`
      UPDATE blood_requests SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `, [status, id]);
    return rows[0] ?? null;
  }

  async getAcceptedDonors(requestId: string): Promise<unknown[]> {
    const { rows } = await this.db.query(`
      SELECT u.name AS donor_name, dp.blood_type, dr.responded_at,
             ST_Distance(dp.location_point, br.location_point) AS distance_meters
      FROM donor_responses dr
      JOIN donor_profiles dp ON dp.id = dr.donor_id
      JOIN users u ON u.id = dp.user_id
      JOIN blood_requests br ON br.id = dr.request_id
      WHERE dr.request_id = $1 AND dr.action = 'ACCEPTED'
    `, [requestId]);
    return rows;
  }

  async recordResponse(donorProfileId: string, requestId: string, action: string): Promise<void> {
    await this.db.query(`
      INSERT INTO donor_responses (donor_id, request_id, action)
      VALUES ($1, $2, $3)
      ON CONFLICT (donor_id, request_id) DO UPDATE SET action = EXCLUDED.action
    `, [donorProfileId, requestId, action]);
  }
}
