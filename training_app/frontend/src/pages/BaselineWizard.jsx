import React, { useState, useEffect } from 'react';
import { api } from '../lib/api.js';   // NEW helper wraps fetch with BASE URL

/*
 * BaselineWizard guides the user through a sequence of exercises during the
 * baseline week. For each exercise, the user enters the heaviest set they
 * managed comfortably. The wizard records weight, reps and RPE and sends
 * them to the backend to compute an estimated 1RM. At the end, a summary
 * table is displayed.
 */

export default function BaselineWizard() {
  const [exercises, setExercises] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputs, setInputs] = useState({ weight: '', reps: '', rpe: '' });
  const [results, setResults] = useState([]);

  // ─────────────────────────────────────────────────────────────
  // Fetch exercises once on mount
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    async function fetchExercises() {
      try {
        const data = await api('/api/exercises');
        // Filter core lifts for baseline
        const names = [
          'Goblet Squat',
          'Dumbbell Bench Press',
          'Single Arm Row',
          'Overhead Press',
          'Romanian Deadlift'
        ];
        setExercises(data.filter((e) => names.includes(e.name)));
      } catch (err) {
        console.error(err);
      }
    }
    fetchExercises();
  }, []);

  const current = exercises[currentIndex];

  // ─────────────────────────────────────────────────────────────
  // Submit baseline set and move to next exercise
  // ─────────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    if (!current) return;

    const payload = {
      exerciseId: current.id,
      date: new Date().toISOString(),
      weight: parseFloat(inputs.weight),
      reps: parseInt(inputs.reps, 10),
      rpe: parseFloat(inputs.rpe)
    };

    try {
      const data = await api('/api/baseline', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      setResults((prev) => [
        ...prev,
        { exercise: current.name, estimated1RM: data.estimated1RM }
      ]);
      setInputs({ weight: '', reps: '', rpe: '' });
      setCurrentIndex((i) => i + 1);
    } catch (err) {
      console.error(err);
      alert('Failed to save baseline set. Check console.');
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Finished all exercises → show summary
  // ─────────────────────────────────────────────────────────────
  if (currentIndex >= exercises.length && exercises.length > 0) {
    return (
      <div>
        <h2 className="text-lg font-semibold mb-2">Baseline Complete</h2>
        <p className="mb-4">
          Below are your estimated one-rep maxes. Future workouts start at
          roughly 65 % of these values and auto-adjust as you progress.
        </p>

        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b border-gray-200 dark:border-gray-700">
              <th className="py-1 pr-2">Exercise</th>
              <th className="py-1 px-2">Estimated&nbsp;1RM&nbsp;(lb)</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr
                key={r.exercise}
                className="border-b border-gray-100 dark:border-gray-800"
              >
                <td className="py-1 pr-2 whitespace-nowrap">{r.exercise}</td>
                <td className="py-1 px-2">{r.estimated1RM.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          You can rerun this wizard anytime to update your baselines.
        </p>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // Wizard form
  // ─────────────────────────────────────────────────────────────
  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Baseline Wizard</h2>

      {current ? (
        <div>
          <p className="mb-2">
            Exercise {currentIndex + 1} of {exercises.length}:{' '}
            <strong>{current.name}</strong>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 max-w-xs">
            <div>
              <label className="block text-sm mb-1">Weight (lb)</label>
              <input
                type="number"
                required
                step="0.5"
                min="0"
                value={inputs.weight}
                onChange={(e) =>
                  setInputs({ ...inputs, weight: e.target.value })
                }
                className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Reps</label>
              <input
                type="number"
                required
                min="1"
                value={inputs.reps}
                onChange={(e) =>
                  setInputs({ ...inputs, reps: e.target.value })
                }
                className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">RPE (1 – 10)</label>
              <input
                type="number"
                required
                min="1"
                max="10"
                step="0.5"
                value={inputs.rpe}
                onChange={(e) =>
                  setInputs({ ...inputs, rpe: e.target.value })
                }
                className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-accent text-white rounded"
            >
              Save&nbsp;and&nbsp;Continue
            </button>
          </form>
        </div>
      ) : (
        <p>Loading exercises…</p>
      )}
    </div>
  );
}
