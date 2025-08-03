import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import BaselineWizard from './pages/BaselineWizard.jsx';
import WorkoutLogger from './pages/WorkoutLogger.jsx';
import VitalsPage from './pages/VitalsPage.jsx';

// The App component provides the overall structure of the single page
// application. It defines a sticky bottom navigation bar for mobile and a
// dark/light mode toggle. Routes map to separate page components.

export default function App() {
  const [dark, setDark] = useState(false);
  const location = useLocation();
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);
  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/baseline', label: 'Baseline' },
    { path: '/workout', label: 'Workout' },
    { path: '/vitals', label: 'Vitals' }
  ];
  return (
    <div className="flex flex-col h-full">
      <header className="p-4 flex justify-between items-center bg-white dark:bg-gray-800 shadow-md">
        <h1 className="text-xl font-bold text-accent">Training Tracker</h1>
        <button
          onClick={() => setDark(!dark)}
          className="rounded px-2 py-1 border border-accent text-accent dark:text-accent dark:border-accent"
        >
          {dark ? 'Light' : 'Dark'}
        </button>
      </header>
      <main className="flex-1 overflow-y-auto p-4 pb-20">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/baseline" element={<BaselineWizard />} />
          <Route path="/workout" element={<WorkoutLogger />} />
          <Route path="/vitals" element={<VitalsPage />} />
        </Routes>
      </main>
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-inner flex justify-around py-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex-1 text-center px-2 ${location.pathname === item.path ? 'text-accent font-medium' : 'text-gray-600 dark:text-gray-300'}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}