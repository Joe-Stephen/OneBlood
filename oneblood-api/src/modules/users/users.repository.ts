import { DbClient } from '@infrastructure/database/db.client';

export interface UserRow {
  id: string;
  google_id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export class UsersRepository {
  constructor(private readonly db: DbClient) {}

  async findById(id: string): Promise<UserRow | null> {
    const { rows } = await this.db.query<UserRow>(
      `SELECT id, google_id, name, email, phone, role, is_active, created_at, updated_at
       FROM users WHERE id = $1 AND deleted_at IS NULL`,
      [id],
    );
    return rows[0] ?? null;
  }

  async update(id: string, data: Partial<{ name: string; phone: string }>): Promise<UserRow | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let i = 1;

    if (data.name  !== undefined) { fields.push(`name = $${i++}`);  values.push(data.name);  }
    if (data.phone !== undefined) { fields.push(`phone = $${i++}`); values.push(data.phone); }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    const { rows } = await this.db.query<UserRow>(`
      UPDATE users SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${i} AND deleted_at IS NULL
      RETURNING id, google_id, name, email, phone, role, is_active, created_at, updated_at
    `, values);
    return rows[0] ?? null;
  }

  async softDelete(id: string): Promise<void> {
    await this.db.query(
      'UPDATE users SET deleted_at = NOW(), is_active = FALSE WHERE id = $1',
      [id],
    );
  }
}
