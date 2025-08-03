import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { api } from '../lib/api.js';   // helper prefixes BASE URL

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

/*
 * Dashboard page. Displays weekly volume (bar chart) and a simple PR board
 * listing the heaviest weight used for each exercise.
 */
export default function Dashboard() {
  const [volumeData, setVolumeData] = useState([]);
  const [prData, setPrData] = useState([]);

  // ───────────── Fetch data on mount ─────────────
  useEffect(() => {
    async function fetchData() {
      try {
        const vol = await api('/api/dashboard/volume?weeks=8');
        setVolumeData(vol);

        const pr = await api('/api/dashboard/pr');
        setPrData(pr);
      } catch (err) {
        console.error(err);
      }
    }
    fetchData();
  }, []);

  // ───────────── Chart.js config ─────────────
  const barData = {
    labels: volumeData.map((v) => v.weekStart),
    datasets: [
      {
        label: 'Weekly Volume (lb·reps)',
        data: volumeData.map((v) => v.volume),
        backgroundColor: '#e36414'
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Training Volume (last 8 weeks)' }
    },
    scales: {
      x: { title: { display: true, text: 'Week starting' } },
      y: { title: { display: true, text: 'Volume (lb·reps)' } }
    }
  };

  // ───────────── Render ─────────────
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-lg font-semibold mb-2">Weekly Volume</h2>
        {volumeData.length ? (
          <Bar data={barData} options={options} />
        ) : (
          <p>Loading chart…</p>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">Personal Records</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                <th className="py-1 pr-2">Exercise</th>
                <th className="py-1 px-2">Max&nbsp;Weight&nbsp;(lb)</th>
              </tr>
            </thead>
            <tbody>
              {prData.map((pr) => (
                <tr
                  key={pr.exerciseId}
                  className="border-b border-gray-100 dark:border-gray-800"
                >
                  <td className="py-1 pr-2 whitespace-nowrap">
                    {pr.exerciseName}
                  </td>
                  <td className="py-1 px-2">
                    {pr.maxWeight ? pr.maxWeight.toFixed(1) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
