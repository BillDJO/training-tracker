import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { readFileSync } from 'fs';
import path from 'path';

// This module centralises database access. It opens the SQLite database and
// applies the schema if the database does not yet exist. SQLite is used for
// its simplicity and portability.

const DB_FILE = process.env.DB_FILE || path.join(process.cwd(), 'database.db');

async function initDatabase() {
  const db = await open({
    filename: DB_FILE,
    driver: sqlite3.Database
  });
  // Apply schema on first run. The schema file contains all CREATE TABLE
  // statements. When migrations are required in the future, this logic
  // should be extended accordingly.
  const schemaPath = path.join(process.cwd(), 'sql', 'schema.sql');
  const schema = readFileSync(schemaPath, 'utf8');
  await db.exec(schema);
  return db;
}

export default initDatabase;