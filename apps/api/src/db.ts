import { DatabaseSync } from 'node:sqlite'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

export type DB = DatabaseSync

/** Open (and create / migrate) the database. `:memory:` for tests. */
export function openDb(path: string): DB {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true })
  const db = new DatabaseSync(path)
  db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 3000;')
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      email_verified INTEGER NOT NULL DEFAULT 0,
      password_hash TEXT,
      name TEXT NOT NULL DEFAULT '',
      avatar_url TEXT,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS identities (
      provider TEXT NOT NULL,
      provider_user_id TEXT NOT NULL,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at INTEGER NOT NULL,
      PRIMARY KEY (provider, provider_user_id)
    );
    CREATE TABLE IF NOT EXISTS email_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      purpose TEXT NOT NULL,
      code_hash TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0,
      used INTEGER NOT NULL DEFAULT 0,
      ip TEXT,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS email_codes_email ON email_codes(email, purpose, created_at);
    CREATE INDEX IF NOT EXISTS email_codes_ip ON email_codes(ip, created_at);
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS login_attempts (
      key TEXT NOT NULL,
      at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS login_attempts_key ON login_attempts(key, at);
    CREATE TABLE IF NOT EXISTS oauth_states (
      state TEXT PRIMARY KEY,
      provider TEXT NOT NULL,
      next TEXT NOT NULL,
      expires_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS designs (
      id TEXT NOT NULL,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      data TEXT NOT NULL,
      updated_at INTEGER NOT NULL,
      PRIMARY KEY (user_id, id)
    );
    CREATE TABLE IF NOT EXISTS shares (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      data TEXT NOT NULL,
      views INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS shares_user ON shares(user_id, created_at);
  `)
  return db
}
