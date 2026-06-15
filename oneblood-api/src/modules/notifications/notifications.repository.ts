import { DbClient } from '@infrastructure/database/db.client';

export interface NotificationRow {
  id: string;
  user_id: string;
  request_id: string | null;
  type: string;
  channel: string;
  status: string;
  body: string;
  metadata: Record<string, unknown>;
  sent_at: Date | null;
  read_at: Date | null;
  created_at: Date;
}

export class NotificationsRepository {
  constructor(private readonly db: DbClient) {}

  async findByUser(userId: string, params: {
    status?: string; type?: string; limit: number; offset: number;
  }): Promise<{ notifications: NotificationRow[]; total: number; unreadCount: number }> {
    const conditions = ['user_id = $1'];
    const values: unknown[] = [userId];
    let i = 2;

    if (params.status === 'UNREAD') { conditions.push(`read_at IS NULL`); }
    if (params.status === 'READ')   { conditions.push(`read_at IS NOT NULL`); }
    if (params.type)                { conditions.push(`type = $${i++}`); values.push(params.type); }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const countRes = await this.db.query<{ count: string }>(
      `SELECT COUNT(*) FROM notifications ${where}`, values,
    );
    const total = Number(countRes.rows[0]?.count ?? 0);

    const unreadRes = await this.db.query<{ count: string }>(
      'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND read_at IS NULL',
      [userId],
    );
    const unreadCount = Number(unreadRes.rows[0]?.count ?? 0);

    values.push(params.limit, params.offset);
    const { rows } = await this.db.query<NotificationRow>(`
      SELECT * FROM notifications ${where}
      ORDER BY created_at DESC
      LIMIT $${i++} OFFSET $${i++}
    `, values);

    return { notifications: rows, total, unreadCount };
  }

  async markRead(id: string, userId: string): Promise<void> {
    await this.db.query(
      'UPDATE notifications SET read_at = NOW(), status = \'READ\' WHERE id = $1 AND user_id = $2',
      [id, userId],
    );
  }

  async markAllRead(userId: string): Promise<number> {
    const { rowCount } = await this.db.query(
      'UPDATE notifications SET read_at = NOW(), status = \'READ\' WHERE user_id = $1 AND read_at IS NULL',
      [userId],
    );
    return rowCount ?? 0;
  }

  async create(data: {
    userId: string; requestId?: string; type: string; channel: string; body: string; metadata?: Record<string, unknown>;
  }): Promise<NotificationRow> {
    const { rows } = await this.db.query<NotificationRow>(`
      INSERT INTO notifications (user_id, request_id, type, channel, status, body, metadata, sent_at)
      VALUES ($1, $2, $3, $4, 'SENT', $5, $6, NOW())
      RETURNING *
    `, [data.userId, data.requestId ?? null, data.type, data.channel, data.body, JSON.stringify(data.metadata ?? {})]);
    return rows[0];
  }
}
