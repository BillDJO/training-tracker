import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import initDatabase from './db.js';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

/*
 * Main entry point for the backend. This Express server exposes a JSON REST
 * interface for the training app. SQLite persists all data locally on the
 * server. Data never leaves the user's environment unless the optional
 * Supabase integration is configured by the user.
 */

async function buildServer() {
  const app = express();
  const db = await initDatabase();

  app.use(cors());
  app.use(bodyParser.json());

  // ─────────────────────────────────────────────────────────────
  // Simple health-check so Render/Vercel/etc. can probe the API.
  // GET https://…/api/ping  →  { ok: true }
  // ─────────────────────────────────────────────────────────────
  app.get('/api/ping', (_req, res) => {
    res.json({ ok: true });
  });

  /*
   * GET /api/exercises
   * Returns a list of all available exercises.
   */
  app.get('/api/exercises', async (_req, res) => {
    const rows = await db.all('SELECT * FROM exercises ORDER BY name');
    res.json(rows);
  });

  /*
   * POST /api/workouts
   * Body: { date, duration, notes?, sets: [ { exerciseId, weight, reps, rpe, notes? } ] }
   */
  app.post('/api/workouts', async (req, res) => {
    const { date, duration, notes, sets } = req.body;
    if (!date || !Array.isArray(sets)) {
      return res.status(400).json({ error: 'date and sets are required' });
    }
    const tx = await db.run('BEGIN TRANSACTION');
    try {
      const result = await db.run(
        'INSERT INTO workouts (date, duration, notes) VALUES (?, ?, ?)',
        [date, duration || null, notes || null]
      );
      const workoutId = result.lastID;
      let index = 0;
      for (const s of sets) {
        await db.run(
          'INSERT INTO sets (workout_id, exercise_id, set_index, weight, reps, rpe, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [workoutId, s.exerciseId, index, s.weight || null, s.reps || null, s.rpe || null, s.notes || null]
        );
        index++;
      }
      await db.run('COMMIT');
      res.json({ id: workoutId });
    } catch (err) {
      await db.run('ROLLBACK');
      console.error(err);
      res.status(500).json({ error: 'Failed to create workout' });
    }
  });

  /*
   * GET /api/workouts
   */
  app.get('/api/workouts', async (_req, res) => {
    const rows = await db.all('SELECT * FROM workouts ORDER BY date DESC');
    res.json(rows);
  });

  /*
   * GET /api/workouts/:id
   */
  app.get('/api/workouts/:id', async (req, res) => {
    const id = req.params.id;
    const workout = await db.get('SELECT * FROM workouts WHERE id = ?', [id]);
    if (!workout) return res.status(404).json({ error: 'Not found' });
    const sets = await db.all('SELECT * FROM sets WHERE workout_id = ? ORDER BY set_index ASC', [id]);
    res.json({ ...workout, sets });
  });

  /*
   * POST /api/vitals
   */
  app.post('/api/vitals', async (req, res) => {
    const {
      date, systolic, diastolic, heart_rate,
      cholesterol_total, ldl, hdl, triglycerides,
      bodyweight, body_fat, comment
    } = req.body;

    if (!date) return res.status(400).json({ error: 'date is required' });

    await db.run(
      'INSERT INTO vitals (date, systolic, diastolic, heart_rate, cholesterol_total, ldl, hdl, triglycerides, bodyweight, body_fat, comment) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        date, systolic || null, diastolic || null, heart_rate || null,
        cholesterol_total || null, ldl || null, hdl || null, triglycerides || null,
        bodyweight || null, body_fat || null, comment || null
      ]
    );
    res.json({ success: true });
  });

  /*
   * GET /api/vitals
   */
  app.get('/api/vitals', async (_req, res) => {
    const rows = await db.all('SELECT * FROM vitals ORDER BY date DESC');
    res.json(rows);
  });

  /*
   * POST /api/baseline
   */
  app.post('/api/baseline', async (req, res) => {
    const { exerciseId, date, weight, reps, rpe } = req.body;
    if (!exerciseId || !date || !weight || !reps) {
      return res.status(400).json({ error: 'exerciseId, date, weight and reps are required' });
    }
    const estimated1RM = weight * reps / (1 - 0.0333 * reps); // Epley
    await db.run(
      'INSERT INTO baseline_results (exercise_id, date, weight, reps, rpe, estimated_1rm) VALUES (?, ?, ?, ?, ?, ?)',
      [exerciseId, date, weight, reps, rpe || null, estimated1RM]
    );

    const existing = await db.get('SELECT * FROM progressions WHERE exercise_id = ?', [exerciseId]);
    if (!existing) {
      let targetWeight = Math.round((estimated1RM * 0.65) / 5) * 5;
      const targetReps = 10;
      await db.run(
        'INSERT INTO progressions (exercise_id, target_weight, target_reps, next_weight, next_reps, last_updated) VALUES (?, ?, ?, ?, ?, ?)',
        [exerciseId, targetWeight, targetReps, targetWeight, targetReps, date]
      );
    }
    res.json({ estimated1RM });
  });

  /*
   * GET /api/baseline/:exerciseId
   */
  app.get('/api/baseline/:exerciseId', async (req, res) => {
    const exerciseId = req.params.exerciseId;
    const rows = await db.all(
      'SELECT * FROM baseline_results WHERE exercise_id = ? ORDER BY date DESC',
      [exerciseId]
    );
    const prog = await db.get('SELECT * FROM progressions WHERE exercise_id = ?', [exerciseId]);
    res.json({ results: rows, progression: prog });
  });

  /*
   * POST /api/progression/update
   */
  app.post('/api/progression/update', async (req, res) => {
    const { exerciseId, performedReps } = req.body;
    const prog = await db.get('SELECT * FROM progressions WHERE exercise_id = ?', [exerciseId]);
    if (!prog) return res.status(404).json({ error: 'Progression not found' });

    let { target_weight: targetWeight, target_reps: targetReps } = prog;
    if (performedReps >= targetReps + 2) {
      targetWeight += 5;
    } else if (performedReps < targetReps) {
      targetWeight = Math.max(5, targetWeight - 5);
    }

    await db.run(
      'UPDATE progressions SET target_weight = ?, next_weight = ?, last_updated = ? WHERE exercise_id = ?',
      [targetWeight, targetWeight, new Date().toISOString(), exerciseId]
    );
    res.json({ targetWeight, targetReps });
  });

  /*
   * GET /api/dashboard/volume?weeks=<n>
   */
  app.get('/api/dashboard/volume', async (req, res) => {
    const weeks = parseInt(req.query.weeks || '8');
    const now = new Date();
    const results = [];
    for (let i = 0; i < weeks; i++) {
      const weekEnd = new Date(now);
      weekEnd.setDate(now.getDate() - (now.getDay() + i * 7));
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekEnd.getDate() - 6);
      const weekStartISO = weekStart.toISOString().split('T')[0];
      const weekEndISO = weekEnd.toISOString().split('T')[0];
      const row = await db.get(
        `SELECT SUM(weight * reps) AS volume FROM sets
         JOIN workouts ON sets.workout_id = workouts.id
         WHERE date BETWEEN ? AND ?`,
        [weekStartISO, weekEndISO]
      );
      results.unshift({ weekStart: weekStartISO, volume: row.volume || 0 });
    }
    res.json(results);
  });

  /*
   * GET /api/dashboard/pr
   */
  app.get('/api/dashboard/pr', async (_req, res) => {
    const rows = await db.all(
      `SELECT exercises.id AS exerciseId, exercises.name AS exerciseName, MAX(sets.weight) AS maxWeight
       FROM sets
       JOIN exercises ON sets.exercise_id = exercises.id
       GROUP BY exerciseId
       ORDER BY exerciseName`
    );
    res.json(rows);
  });

  /*
   * POST /api/backup
   */
  app.post('/api/backup', async (req, res) => {
    const { passphrase } = req.body;
    if (!passphrase) return res.status(400).json({ error: 'passphrase required' });

    const dbPath = path.join(process.cwd(), 'database.db');
    const data = fs.readFileSync(dbPath);
    const salt = crypto.randomBytes(16);
    const key = crypto.pbkdf2Sync(passphrase, salt, 100000, 32, 'sha256');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
    const payload = Buffer.concat([salt, iv, encrypted]);
    res.json({ backup: payload.toString('base64') });
  });

  /*
   * POST /api/restore
   */
  app.post('/api/restore', async (req, res) => {
    const { passphrase, backup } = req.body;
    if (!passphrase || !backup) return res.status(400).json({ error: 'passphrase and backup required' });
    try {
      const payload = Buffer.from(backup, 'base64');
      const salt = payload.slice(0, 16);
      const iv = payload.slice(16, 32);
      const encrypted = payload.slice(32);
      const key = crypto.pbkdf2Sync(passphrase, salt, 100000, 32, 'sha256');
      const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
      const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
      const dbPath = path.join(process.cwd(), 'database.db');
      fs.writeFileSync(dbPath, decrypted);
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to restore database' });
    }
  });

  // ─────────────────────────────────────────────────────────────
  // Start server
  // ─────────────────────────────────────────────────────────────
  const port = process.env.PORT || 3001;
  app.listen(port, () => {
    console.log(`Training backend listening on http://localhost:${port}`);
  });
}

buildServer().catch((err) => {
  console.error(err);
  process.exit(1);
});
