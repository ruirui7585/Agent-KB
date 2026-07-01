import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dir = path.dirname(fileURLToPath(import.meta.url));
const dataDir = process.env.CALSNAP_DATA_DIR
  ? path.resolve(process.env.CALSNAP_DATA_DIR)
  : path.join(__dir, '..', 'data');
const dbPath = process.env.CALSNAP_DB_PATH || path.join(dataDir, 'foodmind.db');
if (dbPath !== ':memory:') fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS profile (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS records (
    id         TEXT PRIMARY KEY,
    date       TEXT NOT NULL,
    time       TEXT NOT NULL,
    meal_type  TEXT NOT NULL CHECK(meal_type IN ('breakfast','lunch','dinner','snack')),
    foods_json TEXT NOT NULL,
    total_cal  REAL NOT NULL,
    image_path TEXT,
    source     TEXT NOT NULL DEFAULT 'vision',
    created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
  );
  CREATE INDEX IF NOT EXISTS idx_records_date ON records(date);

  CREATE TABLE IF NOT EXISTS exercises (
    id               TEXT PRIMARY KEY,
    date             TEXT NOT NULL,
    time             TEXT NOT NULL,
    exercise_type    TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL,
    intensity        TEXT NOT NULL CHECK(intensity IN ('light','moderate','high')),
    calories         REAL NOT NULL,
    note             TEXT,
    created_at       TEXT NOT NULL DEFAULT (datetime('now','localtime'))
  );
  CREATE INDEX IF NOT EXISTS idx_exercises_date ON exercises(date);

  CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS barcode_cache (
    barcode    TEXT PRIMARY KEY,
    data_json  TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
  );
`);

export default db;
