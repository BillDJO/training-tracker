-- Schema for the personal training tracker.
-- Tables are designed to store workouts, sets, baseline measurements,
-- progression targets, vitals, goals and exercise definitions.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS exercises (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  equipment TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS workouts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  duration INTEGER,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS sets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  workout_id INTEGER NOT NULL,
  exercise_id INTEGER NOT NULL,
  set_index INTEGER NOT NULL,
  weight REAL,
  reps INTEGER,
  rpe REAL,
  notes TEXT,
  FOREIGN KEY(workout_id) REFERENCES workouts(id) ON DELETE CASCADE,
  FOREIGN KEY(exercise_id) REFERENCES exercises(id)
);

CREATE TABLE IF NOT EXISTS vitals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  systolic INTEGER,
  diastolic INTEGER,
  heart_rate INTEGER,
  cholesterol_total INTEGER,
  ldl INTEGER,
  hdl INTEGER,
  triglycerides INTEGER,
  bodyweight REAL,
  body_fat REAL,
  comment TEXT
);

CREATE TABLE IF NOT EXISTS goals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  target_value REAL,
  unit TEXT,
  current_value REAL
);

CREATE TABLE IF NOT EXISTS baseline_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  exercise_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  weight REAL NOT NULL,
  reps INTEGER NOT NULL,
  rpe REAL,
  estimated_1rm REAL,
  FOREIGN KEY(exercise_id) REFERENCES exercises(id)
);

CREATE TABLE IF NOT EXISTS progressions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  exercise_id INTEGER NOT NULL UNIQUE,
  target_weight REAL,
  target_reps INTEGER,
  next_weight REAL,
  next_reps INTEGER,
  last_updated TEXT,
  FOREIGN KEY(exercise_id) REFERENCES exercises(id)
);

-- Seed some exercises relevant to the user's equipment. This list can be
-- extended within the application if new movements are added.
INSERT OR IGNORE INTO exercises (name, type, equipment) VALUES
('Goblet Squat', 'legs', 'dumbbell'),
('Dumbbell Bench Press', 'push', 'dumbbell'),
('Single Arm Row', 'pull', 'dumbbell'),
('Overhead Press', 'push', 'dumbbell'),
('Romanian Deadlift', 'legs', 'barbell'),
('Split Squat', 'legs', 'dumbbell'),
('Kettlebell Swing', 'hinge', 'kettlebell'),
('Push-Up', 'push', 'bodyweight'),
('Biceps Curl', 'pull', 'dumbbell'),
('Triceps Extension', 'push', 'dumbbell'),
('Plank', 'core', 'bodyweight'),
('Bird Dog', 'core', 'bodyweight'),
('Glute Bridge', 'glute', 'bodyweight'),
('Incline Dumbbell Bench Press', 'push', 'dumbbell'),
('Seated Shoulder Press', 'push', 'dumbbell'),
('Renegade Row', 'pull', 'dumbbell'),
('Lunge', 'legs', 'dumbbell'),
('Russian Twist', 'core', 'weight plate'),
('Farmer Carry', 'full', 'dumbbell'),
('Floor Press', 'push', 'dumbbell');