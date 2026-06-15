import { DbClient } from '@infrastructure/database/db.client';
import { COOLDOWN_DAYS, DonationType } from '@shared/constants/cooldown.constants';
import { addDays } from '@shared/utils/date.util';

export interface DonationRow {
  id: string;
  donor_id: string;
  request_id: string | null;
  hospital_id: string | null;
  donation_type: string;
  units_donated: number;
  donated_at: Date;
  next_eligible_date: string;
  notes: string | null;
  created_at: Date;
}

export interface CreateDonationData {
  donorProfileId: string;
  requestId?: string;
  hospitalId?: string;
  donationType: DonationType;
  unitsDonated: number;
  donatedAt: Date;
  notes?: string;
}

export class DonationsRepository {
  constructor(private readonly db: DbClient) {}

  async create(data: CreateDonationData): Promise<DonationRow> {
    const cooldown = COOLDOWN_DAYS[data.donationType];
    const nextEligible = addDays(data.donatedAt, cooldown).toISOString().split('T')[0];

    const { rows } = await this.db.query<DonationRow>(`
      INSERT INTO donations
        (donor_id, request_id, hospital_id, donation_type, units_donated, donated_at, next_eligible_date, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      data.donorProfileId,
      data.requestId ?? null,
      data.hospitalId ?? null,
      data.donationType,
      data.unitsDonated,
      data.donatedAt,
      nextEligible,
      data.notes ?? null,
    ]);
    return rows[0];
  }

  async findByDonorProfile(donorProfileId: string, params: { limit: number; offset: number }): Promise<{ donations: DonationRow[]; total: number }> {
    const countRes = await this.db.query<{ count: string }>(
      'SELECT COUNT(*) FROM donations WHERE donor_id = $1',
      [donorProfileId],
    );
    const total = Number(countRes.rows[0]?.count ?? 0);

    const { rows } = await this.db.query<DonationRow>(`
      SELECT d.*, h.name AS hospital_name
      FROM donations d
      LEFT JOIN hospitals h ON h.id = d.hospital_id
      WHERE d.donor_id = $1
      ORDER BY d.donated_at DESC
      LIMIT $2 OFFSET $3
    `, [donorProfileId, params.limit, params.offset]);

    return { donations: rows, total };
  }

  async findById(id: string): Promise<DonationRow | null> {
    const { rows } = await this.db.query<DonationRow>(
      'SELECT * FROM donations WHERE id = $1',
      [id],
    );
    return rows[0] ?? null;
  }
}
