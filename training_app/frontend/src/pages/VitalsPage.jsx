import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

/*
 * VitalsPage allows the user to record health vitals like blood pressure,
 * cholesterol and bodyweight and view trends over time. It emphasises
 * cardiovascular health, which is important given the user's pre‑hypertensive
 * status and elevated cholesterol. Data is stored in the backend and
 * displayed via line charts.
 */

export default function VitalsPage() {
  const [inputs, setInputs] = useState({ date: new Date().toISOString().substring(0, 10), systolic: '', diastolic: '', bodyweight: '', heart_rate: '', cholesterol_total: '' });
  const [vitals, setVitals] = useState([]);
  useEffect(() => {
    async function fetchVitals() {
      const res = await fetch('/api/vitals');
      const data = await res.json();
      setVitals(data.reverse());
    }
    fetchVitals();
  }, []);
  async function handleSave() {
    const res = await fetch('/api/vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: inputs.date,
        systolic: inputs.systolic ? parseInt(inputs.systolic) : null,
        diastolic: inputs.diastolic ? parseInt(inputs.diastolic) : null,
        heart_rate: inputs.heart_rate ? parseInt(inputs.heart_rate) : null,
        cholesterol_total: inputs.cholesterol_total ? parseInt(inputs.cholesterol_total) : null,
        bodyweight: inputs.bodyweight ? parseFloat(inputs.bodyweight) : null
      })
    });
    if (res.ok) {
      alert('Vitals saved');
      const newEntry = await res.json();
      // Reload vitals
      const res2 = await fetch('/api/vitals');
      const data = await res2.json();
      setVitals(data.reverse());
    }
  }
  // Prepare chart data for blood pressure and weight
  const bpData = {
    labels: vitals.map((v) => v.date),
    datasets: [
      {
        label: 'Systolic',
        data: vitals.map((v) => v.systolic),
        borderColor: '#e36414',
        backgroundColor: 'rgba(227,100,20,0.2)',
        tension: 0.3
      },
      {
        label: 'Diastolic',
        data: vitals.map((v) => v.diastolic),
        borderColor: '#f0a202',
        backgroundColor: 'rgba(240,162,2,0.2)',
        tension: 0.3
      }
    ]
  };
  const weightData = {
    labels: vitals.map((v) => v.date),
    datasets: [
      {
        label: 'Bodyweight (lb)',
        data: vitals.map((v) => v.bodyweight),
        borderColor: '#1e90ff',
        backgroundColor: 'rgba(30,144,255,0.2)',
        tension: 0.3
      }
    ]
  };
  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: false }
    },
    scales: {
      x: { title: { display: true, text: 'Date' } },
      y: { title: { display: true, text: 'Value' } }
    }
  };
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Vitals</h2>
      <div className="max-w-md space-y-2">
        <div>
          <label className="block text-sm mb-1">Date</label>
          <input type="date" value={inputs.date} onChange={(e) => setInputs({ ...inputs, date: e.target.value })} className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700" />
        </div>
        <div className="flex space-x-2">
          <div className="flex-1">
            <label className="block text-sm mb-1">Systolic BP</label>
            <input type="number" value={inputs.systolic} onChange={(e) => setInputs({ ...inputs, systolic: e.target.value })} className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700" />
          </div>
          <div className="flex-1">
            <label className="block text-sm mb-1">Diastolic BP</label>
            <input type="number" value={inputs.diastolic} onChange={(e) => setInputs({ ...inputs, diastolic: e.target.value })} className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700" />
          </div>
        </div>
        <div>
          <label className="block text-sm mb-1">Heart Rate (bpm)</label>
          <input type="number" value={inputs.heart_rate} onChange={(e) => setInputs({ ...inputs, heart_rate: e.target.value })} className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700" />
        </div>
        <div>
          <label className="block text-sm mb-1">Total Cholesterol (mg/dL)</label>
          <input type="number" value={inputs.cholesterol_total} onChange={(e) => setInputs({ ...inputs, cholesterol_total: e.target.value })} className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700" />
        </div>
        <div>
          <label className="block text-sm mb-1">Bodyweight (lb)</label>
          <input type="number" step="0.1" value={inputs.bodyweight} onChange={(e) => setInputs({ ...inputs, bodyweight: e.target.value })} className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700" />
        </div>
        <button onClick={handleSave} className="w-full py-2 bg-accent text-white rounded">Save Vitals</button>
      </div>
      {vitals.length > 0 && (
        <div className="space-y-6">
          <div>
            <h3 className="font-medium mb-2">Blood Pressure Trends</h3>
            <Line data={bpData} options={{ ...options, scales: { ...options.scales, y: { ...options.scales.y, title: { display: true, text: 'Blood Pressure (mm Hg)' } } } }} />
          </div>
          <div>
            <h3 className="font-medium mb-2">Bodyweight Trend</h3>
            <Line data={weightData} options={{ ...options, scales: { ...options.scales, y: { ...options.scales.y, title: { display: true, text: 'Bodyweight (lb)' } } } }} />
          </div>
        </div>
      )}
    </div>
  );
}