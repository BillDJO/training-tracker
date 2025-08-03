import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

/*
 * Dashboard page. Displays weekly volume using a bar chart and a simple PR
 * board listing the heaviest weight used for each exercise. Fetches data
 * from the backend on mount.
 */

export default function Dashboard() {
  const [volumeData, setVolumeData] = useState([]);
  const [prData, setPrData] = useState([]);
  useEffect(() => {
    async function fetchData() {
      const volRes = await fetch('/api/dashboard/volume');
      const vol = await volRes.json();
      setVolumeData(vol);
      const prRes = await fetch('/api/dashboard/pr');
      const pr = await prRes.json();
      setPrData(pr);
    }
    fetchData();
  }, []);
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
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Training Volume (last 8 weeks)'
      }
    },
    scales: {
      x: {
        title: { display: true, text: 'Week starting' }
      },
      y: {
        title: { display: true, text: 'Volume (lb·reps)' }
      }
    }
  };
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-lg font-semibold mb-2">Weekly Volume</h2>
        {volumeData.length ? <Bar data={barData} options={options} /> : <p>Loading chart…</p>}
      </section>
      <section>
        <h2 className="text-lg font-semibold mb-2">Personal Records</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                <th className="py-1 pr-2">Exercise</th>
                <th className="py-1 px-2">Max Weight (lb)</th>
              </tr>
            </thead>
            <tbody>
              {prData.map((pr) => (
                <tr key={pr.exerciseId} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-1 pr-2 whitespace-nowrap">{pr.exerciseName}</td>
                  <td className="py-1 px-2">{pr.maxWeight ? pr.maxWeight.toFixed(1) : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}