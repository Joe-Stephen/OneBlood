import { DbClient } from '@infrastructure/database/db.client';

export class AdminRepository {
  constructor(private readonly db: DbClient) {}

  async getDashboardStats() {
    const [donors, requests, sos, fulfillment] = await Promise.all([
      this.db.query<{ total: string; active: string }>(`
        SELECT COUNT(*) AS total,
               COUNT(*) FILTER (WHERE availability_status = 'ACTIVE') AS active
        FROM donor_profiles
      `),
      this.db.query<{ open: string }>(`
        SELECT COUNT(*) FILTER (WHERE status = 'OPEN') AS open FROM blood_requests
      `),
      this.db.query<{ active: string }>(`
        SELECT COUNT(*) AS active FROM blood_requests WHERE urgency_level = 'SOS' AND status = 'OPEN'
      `),
      this.db.query<{ fulfilled: string; total: string }>(`
        SELECT
          COUNT(*) FILTER (WHERE status = 'FULFILLED') AS fulfilled,
          COUNT(*) AS total
        FROM blood_requests
        WHERE created_at >= NOW() - INTERVAL '30 days'
      `),
    ]);

    const totalRequests = Number(fulfillment.rows[0]?.total ?? 0);
    const fulfilledRequests = Number(fulfillment.rows[0]?.fulfilled ?? 0);

    return {
      totalDonors:      Number(donors.rows[0]?.total ?? 0),
      activeDonors:     Number(donors.rows[0]?.active ?? 0),
      openRequests:     Number(requests.rows[0]?.open ?? 0),
      sosActive:        Number(sos.rows[0]?.active ?? 0),
      fulfillmentRate:  totalRequests > 0 ? fulfilledRequests / totalRequests : 0,
    };
  }

  async listUsers(params: { role?: string; isActive?: boolean; search?: string; limit: number; offset: number }) {
    const conditions: string[] = ['deleted_at IS NULL'];
    const values: unknown[] = [];
    let i = 1;

    if (params.role !== undefined)     { conditions.push(`role = $${i++}`);      values.push(params.role); }
    if (params.isActive !== undefined) { conditions.push(`is_active = $${i++}`); values.push(params.isActive); }
    if (params.search)                 { conditions.push(`(name ILIKE $${i++} OR email ILIKE $${i++})`); values.push(`%${params.search}%`, `%${params.search}%`); }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const countRes = await this.db.query<{ count: string }>(`SELECT COUNT(*) FROM users ${where}`, values);
    const total = Number(countRes.rows[0]?.count ?? 0);

    values.push(params.limit, params.offset);
    const { rows } = await this.db.query(`
      SELECT u.id, u.name, u.email, u.role, u.is_active, u.created_at,
             dp.blood_type, dp.city
      FROM users u
      LEFT JOIN donor_profiles dp ON dp.user_id = u.id
      ${where}
      ORDER BY u.created_at DESC
      LIMIT $${i++} OFFSET $${i++}
    `, values);

    return { users: rows, total };
  }

  async updateUser(id: string, data: Partial<{ isActive: boolean; role: string }>) {
    const fields: string[] = [];
    const values: unknown[] = [];
    let i = 1;

    if (data.isActive !== undefined) { fields.push(`is_active = $${i++}`); values.push(data.isActive); }
    if (data.role !== undefined)     { fields.push(`role = $${i++}`);      values.push(data.role); }

    if (fields.length === 0) return null;
    values.push(id);

    const { rows } = await this.db.query(`
      UPDATE users SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${i} RETURNING id, name, email, role, is_active
    `, values);
    return rows[0];
  }

  async listHospitals(params: { verificationStatus?: string; city?: string; limit: number; offset: number }) {
    const conditions: string[] = [];
    const values: unknown[] = [];
    let i = 1;

    if (params.verificationStatus) { conditions.push(`verification_status = $${i++}`); values.push(params.verificationStatus); }
    if (params.city)               { conditions.push(`city ILIKE $${i++}`);             values.push(`%${params.city}%`); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const countRes = await this.db.query<{ count: string }>(`SELECT COUNT(*) FROM hospitals ${where}`, values);
    const total = Number(countRes.rows[0]?.count ?? 0);

    values.push(params.limit, params.offset);
    const { rows } = await this.db.query(`SELECT * FROM hospitals ${where} ORDER BY created_at DESC LIMIT $${i++} OFFSET $${i++}`, values);
    return { hospitals: rows, total };
  }

  async createHospital(data: Record<string, unknown>) {
    const { rows } = await this.db.query(`
      INSERT INTO hospitals (name, registration_number, contact_email, contact_phone, address, city, state, pincode, location_point)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8, ST_MakePoint($10,$9)::GEOGRAPHY)
      RETURNING *
    `, [data.name, data.registrationNumber, data.contactEmail, data.contactPhone,
        data.address, data.city, data.state, data.pincode,
        (data.location as { lat: number }).lat, (data.location as { lon: number }).lon]);
    return rows[0];
  }

  async verifyHospital(id: string, status: string, adminId: string) {
    const { rows } = await this.db.query(`
      UPDATE hospitals SET verification_status = $1, verified_by = $2, verified_at = NOW(), updated_at = NOW()
      WHERE id = $3 RETURNING *
    `, [status, adminId, id]);
    return rows[0];
  }

  async getAuditLogs(params: { actorId?: string; action?: string; limit: number; offset: number }) {
    const conditions: string[] = [];
    const values: unknown[] = [];
    let i = 1;

    if (params.actorId) { conditions.push(`actor_id = $${i++}`); values.push(params.actorId); }
    if (params.action)  { conditions.push(`action = $${i++}`);   values.push(params.action); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const countRes = await this.db.query<{ count: string }>(`SELECT COUNT(*) FROM audit_logs ${where}`, values);
    const total = Number(countRes.rows[0]?.count ?? 0);

    values.push(params.limit, params.offset);
    const { rows } = await this.db.query(`SELECT * FROM audit_logs ${where} ORDER BY created_at DESC LIMIT $${i++} OFFSET $${i++}`, values);
    return { logs: rows, total };
  }
}
