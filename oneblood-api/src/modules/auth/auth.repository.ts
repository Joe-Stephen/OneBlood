import { DbClient } from '@infrastructure/database/db.client';
import { GoogleProfile } from './auth.types';

export interface UserRow {
  id: string;
  google_id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  is_active: boolean;
}

export class AuthRepository {
  constructor(private readonly db: DbClient) {}

  async upsertUser(profile: GoogleProfile): Promise<UserRow> {
    const { rows } = await this.db.query<UserRow>(`
      INSERT INTO users (google_id, name, email, role)
      VALUES ($1, $2, $3, 'DONOR')
      ON CONFLICT (google_id)
      DO UPDATE SET
        name       = EXCLUDED.name,
        updated_at = NOW()
      RETURNING id, google_id, name, email, phone, role, is_active
    `, [profile.id, profile.name, profile.email]);
    return rows[0];
  }

  async findById(id: string): Promise<UserRow | null> {
    const { rows } = await this.db.query<UserRow>(
      'SELECT id, google_id, name, email, phone, role, is_active FROM users WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );
    return rows[0] ?? null;
  }

  async findByGoogleId(googleId: string): Promise<UserRow | null> {
    const { rows } = await this.db.query<UserRow>(
      'SELECT id, google_id, name, email, phone, role, is_active FROM users WHERE google_id = $1 AND deleted_at IS NULL',
      [googleId],
    );
    return rows[0] ?? null;
  }

  async hasProfile(userId: string): Promise<boolean> {
    const { rows } = await this.db.query<{ exists: boolean }>(
      'SELECT EXISTS(SELECT 1 FROM donor_profiles WHERE user_id = $1) AS exists',
      [userId],
    );
    return rows[0]?.exists ?? false;
  }
}
