import { Pool, PoolClient, QueryResult } from 'pg';
import env from './env';

const isSupabasePoolerHost = (env.DB_HOST || '').includes('pooler.supabase.com');
const resolvedPort = isSupabasePoolerHost && env.DB_PORT === 5432 ? 6543 : env.DB_PORT;
const shouldUseSsl =
  !!process.env.DATABASE_URL ||
  isSupabasePoolerHost ||
  /supabase|neon|railway|render|amazonaws/i.test(env.DB_HOST || '');

// Transient error codes / messages that are safe to retry
const RETRYABLE_ERROR_CODES = new Set([
  'ENOTFOUND',
  'ECONNRESET',
  'ECONNREFUSED',
  'ETIMEDOUT',
  'EPIPE',
  '57P01', // admin_shutdown
  '57P03', // cannot_connect_now
  '08000', // connection_exception
  '08006', // connection_failure
  '08001', // sqlclient_unable_to_establish_sqlconnection
  '08004', // sqlserver_rejected_establishment_of_sqlconnection
  '40001', // serialization_failure (deadlock)
]);

const isRetryable = (error: any): boolean => {
  if (!error) return false;
  const code = error.code as string | undefined;
  if (!code) return false;
  return RETRYABLE_ERROR_CODES.has(code) || error.message?.includes('ENOTFOUND');
};

// PostgreSQL connection pool
// Support both DATABASE_URL (Render) and individual params (local dev)
const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 10,
      min: 1,
      idleTimeoutMillis: 60000,
      connectionTimeoutMillis: 10000,
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
    }
  : {
      host: env.DB_HOST,
      port: resolvedPort,
      database: env.DB_NAME,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      max: 10,
      min: 1,
      idleTimeoutMillis: 60000,
      connectionTimeoutMillis: 10000,
      ssl: shouldUseSsl ? { rejectUnauthorized: false } : undefined,
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
    };

const pool = new Pool(poolConfig);

if (isSupabasePoolerHost && env.DB_PORT === 5432) {
  console.warn('⚠️ Detected Supabase pooler host with port 5432. Auto-switching to 6543.');
}

pool.on('connect', () => {
  console.log('✅ Database connected successfully');
});

pool.on('error', (err: unknown) => {
  // Log but do NOT crash — let the pool recover
  console.error('❌ Unexpected database pool error:', (err as any)?.message || err);
});

// Sleep helper
const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// Query helper with retry logic for transient DB errors
export const query = async (
  text: string,
  params?: any[],
  retries = 3
): Promise<QueryResult> => {
  const start = Date.now();
  let lastError: any;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await pool.query(text, params);
      const duration = Date.now() - start;
      console.log('Executed query', { text, duration, rows: result.rowCount });
      return result;
    } catch (error: any) {
      lastError = error;
      const duration = Date.now() - start;
      if (attempt < retries && isRetryable(error)) {
        const backoff = Math.min(500 * Math.pow(2, attempt - 1), 4000); // 500ms, 1s, 2s...
        console.warn(
          `⚠️ DB query failed (attempt ${attempt}/${retries}), retrying in ${backoff}ms. Error: ${error?.message}`
        );
        await sleep(backoff);
      } else {
        console.error('Query error:', { text, duration, error: error?.message || error });
        throw error;
      }
    }
  }

  throw lastError;
};

// Get a client from the pool (for transactions)
export const getClient = async (): Promise<PoolClient> => {
  return await pool.connect();
};

// Transaction helper
export const transaction = async <T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> => {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Health check
export const healthCheck = async (): Promise<boolean> => {
  try {
    await query('SELECT 1');
    return true;
  } catch (error) {
    console.error('Database health check failed:', (error as any)?.message);
    return false;
  }
};

// Graceful shutdown
export const closePool = async (): Promise<void> => {
  await pool.end();
  console.log('🔌 Database pool closed');
};

export default pool;
