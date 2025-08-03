import React, { useEffect, useState } from 'react';

/*
 * WorkoutLogger allows the user to assemble a workout: select an exercise,
 * record one or more sets with weight, reps and RPE, and submit the
 * workout to the backend. The logger also updates progression for each
 * exercise based on the highest reps achieved in this session.
 */

export default function WorkoutLogger() {
  const [exercises, setExercises] = useState([]);
  const [sets, setSets] = useState([]);
  const [current, setCurrent] = useState({ exerciseId: '', weight: '', reps: '', rpe: '' });
  const [date, setDate] = useState(() => new Date().toISOString().substring(0, 10));
  useEffect(() => {
    async function fetchExercises() {
      const res = await fetch('/api/exercises');
      const data = await res.json();
      setExercises(data);
    }
    fetchExercises();
  }, []);
  function addSet() {
    if (!current.exerciseId || !current.weight || !current.reps) return;
    setSets((prev) => [...prev, { ...current }]);
    setCurrent({ exerciseId: '', weight: '', reps: '', rpe: '' });
  }
  async function saveWorkout() {
    if (sets.length === 0) return;
    // Group sets by exercise to update progression
    const repsByExercise = {};
    sets.forEach((s) => {
      const reps = parseInt(s.reps);
      if (!repsByExercise[s.exerciseId] || reps > repsByExercise[s.exerciseId]) {
        repsByExercise[s.exerciseId] = reps;
      }
    });
    // Post workout
    const res = await fetch('/api/workouts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date,
        duration: null,
        sets: sets.map((s, idx) => ({ exerciseId: parseInt(s.exerciseId), weight: parseFloat(s.weight), reps: parseInt(s.reps), rpe: parseFloat(s.rpe), notes: null }))
      })
    });
    if (res.ok) {
      // Update progressions
      for (const exerciseId of Object.keys(repsByExercise)) {
        await fetch('/api/progression/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ exerciseId: parseInt(exerciseId), performedReps: repsByExercise[exerciseId] })
        });
      }
      alert('Workout saved!');
      setSets([]);
    } else {
      alert('Error saving workout');
    }
  }
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Log Workout</h2>
      <div className="space-y-2 max-w-md">
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
            value={current.exerciseId}
            onChange={(e) => setCurrent({ ...current, exerciseId: e.target.value })}
            className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
          >
            <option value="">Select exercise</option>
            {exercises.map((ex) => (
              <option key={ex.id} value={ex.id}>{ex.name}</option>
            ))}
          </select>
        </div>
        <div className="flex space-x-2">
          <div className="flex-1">
            <label className="block text-sm mb-1">Weight (lb)</label>
            <input
              type="number"
              step="0.5"
              min="0"
              value={current.weight}
              onChange={(e) => setCurrent({ ...current, weight: e.target.value })}
              className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm mb-1">Reps</label>
            <input
              type="number"
              min="1"
              value={current.reps}
              onChange={(e) => setCurrent({ ...current, reps: e.target.value })}
              className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm mb-1">RPE</label>
            <input
              type="number"
              step="0.5"
              min="1"
              max="10"
              value={current.rpe}
              onChange={(e) => setCurrent({ ...current, rpe: e.target.value })}
              className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
            />
          </div>
        </div>
        <button onClick={addSet} className="w-full py-2 bg-accent text-white rounded">Add Set</button>
      </div>
      {sets.length > 0 && (
        <div className="mt-4 max-w-md">
          <h3 className="text-md font-medium mb-2">Sets</h3>
          <ul className="space-y-1 text-sm">
            {sets.map((s, idx) => {
              const ex = exercises.find((e) => e.id === parseInt(s.exerciseId));
              return (
                <li key={idx} className="border p-2 rounded dark:border-gray-700 flex justify-between items-center">
                  <div>
                    <div className="font-medium">{ex ? ex.name : s.exerciseId}</div>
                    <div className="text-xs text-gray-500">{s.weight} lb x {s.reps} reps @ RPE {s.rpe}</div>
                  </div>
                  <button
                    onClick={() => setSets(sets.filter((_, i) => i !== idx))}
                    className="text-xs text-red-500"
                  >Remove</button>
                </li>
              );
            })}
          </ul>
          <button onClick={saveWorkout} className="w-full mt-2 py-2 bg-emerald-600 text-white rounded">Save Workout</button>
        </div>
      )}
    </div>
  );
}