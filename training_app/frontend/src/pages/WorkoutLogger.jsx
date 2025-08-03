import React, { useEffect, useState } from 'react';
import { api } from '../lib/api.js';   // helper prepends BACKEND URL

/*
 * WorkoutLogger lets the user log a workout: choose an exercise, enter
 * weight/reps/RPE, add multiple sets, then save the workout.
 */
export default function WorkoutLogger() {
  const [exercises, setExercises] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selected, setSelected] = useState('');
  const [setInputs, setSetInputs] = useState({ weight: '', reps: '', rpe: '' });
  const [sets, setSets] = useState([]);
  const [saving, setSaving] = useState(false);

  // ───────────── Load exercise list ─────────────
  useEffect(() => {
    async function load() {
      try {
        const data = await api('/api/exercises');
        setExercises(data);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  // ───────────── Add a set to local array ─────────────
  function handleAddSet(e) {
    e.preventDefault();
    if (!selected) return alert('Choose an exercise first.');
    setSets((prev) => [
      ...prev,
      { exerciseId: selected, ...setInputs }
    ]);
    setSetInputs({ weight: '', reps: '', rpe: '' });
  }

  // ───────────── Submit workout to backend ─────────────
  async function handleSaveWorkout() {
    if (sets.length === 0) return alert('Add at least one set.');
    setSaving(true);
    try {
      await api('/api/workouts', {
        method: 'POST',
        body: JSON.stringify({
          date,
          duration: null,
          sets: sets.map((s, i) => ({ ...s, setIndex: i }))
        })
      });
      // update progression for each exercise
      for (const s of sets) {
        await api('/api/progression/update', {
          method: 'POST',
          body: JSON.stringify({
            exerciseId: s.exerciseId,
            performedReps: parseInt(s.reps, 10)
          })
        });
      }
      alert('Workout saved!');
      setSets([]);
    } catch (err) {
      console.error(err);
      alert('Failed to save workout.');
    } finally {
      setSaving(false);
    }
  }

  // ───────────── Render ─────────────
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Log Workout</h2>

      {/* Form for individual set */}
      <form onSubmit={handleAddSet} className="space-y-4 max-w-sm">
        <div>
          <label className="block text-sm mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Exercise</label>
          <select
            value={selected}
            onChange={(e) => setSelected(parseInt(e.target.value, 10))}
            className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
          >
            <option value="">Select exercise</option>
            {exercises.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <input
            type="number"
            placeholder="Weight (lb)"
            required
            value={setInputs.weight}
            onChange={(e) =>
              setSetInputs({ ...setInputs, weight: e.target.value })
            }
            className="p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
          />
          <input
            type="number"
            placeholder="Reps"
            required
            value={setInputs.reps}
            onChange={(e) =>
              setSetInputs({ ...setInputs, reps: e.target.value })
            }
            className="p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
          />
          <input
            type="number"
            placeholder="RPE"
            required
            value={setInputs.rpe}
            onChange={(e) =>
              setSetInputs({ ...setInputs, rpe: e.target.value })
            }
            className="p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 bg-accent text-white rounded"
        >
          Add Set
        </button>
      </form>

      {/* List of sets added so far */}
      {sets.length > 0 && (
        <div>
          <h3 className="font-medium mb-1">Sets</h3>
          <ul className="text-sm list-disc pl-5">
            {sets.map((s, i) => {
              const ex = exercises.find((e) => e.id === s.exerciseId);
              return (
                <li key={i}>
                  {ex?.name || '—'} — {s.weight} lb × {s.reps} reps @ RPE&nbsp;
                  {s.rpe}
                </li>
              );
            })}
          </ul>
          <button
            disabled={saving}
            onClick={handleSaveWorkout}
            className="mt-4 w-full py-2 bg-accent text-white rounded"
          >
            {saving ? 'Saving…' : 'Save Workout'}
          </button>
        </div>
      )}
    </div>
  );
}
