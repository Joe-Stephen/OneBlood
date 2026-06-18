import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { dbConfig } from '@config';

function buildPoolConfig() {
  const base = {
    min:                     dbConfig.DB_POOL_MIN,
    max:                     dbConfig.DB_POOL_MAX,
    idleTimeoutMillis:       30_000,
    connectionTimeoutMillis: 5_000,
    statement_timeout:       5_000,
  };

  if (dbConfig.DATABASE_URL) {
    // Supabase / managed DB — use connection string + TLS
    return {
      ...base,
      connectionString: dbConfig.DATABASE_URL,
      ssl: { rejectUnauthorized: false }, // Required for Supabase TLS
    };
  }

  // Local development — use individual vars (no SSL)
  return {
    ...base,
    host:     dbConfig.DB_HOST,
    port:     dbConfig.DB_PORT,
    database: dbConfig.DB_NAME,
    user:     dbConfig.DB_USER,
    password: dbConfig.DB_PASSWORD,
  };
}

export class DbClient {
  private pool: Pool;

  constructor() {
    this.pool = new Pool(buildPoolConfig());

    this.pool.on('error', (err) => {
      console.error('Unexpected DB pool error:', err);
    });
  }

  async query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: unknown[],
  ): Promise<QueryResult<T>> {
    return this.pool.query<T>(text, params);
  }

  async getClient(): Promise<PoolClient> {
    return this.pool.connect();
  }

  async end(): Promise<void> {
    await this.pool.end();
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.pool.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }
}
