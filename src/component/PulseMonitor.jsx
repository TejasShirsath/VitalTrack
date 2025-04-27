import React, { useEffect, useState, useMemo } from 'react';
import { io } from 'socket.io-client';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const socket = io('http://192.168.1.7:3001');

function PulseMonitor() {
  const [pulseHistory, setPulseHistory] = useState(Array(100).fill(0));
  const [labels, setLabels] = useState(Array(100).fill(''));
  const [heartRate, setHeartRate] = useState(0);
  const [systolic, setSystolic] = useState(120);
  const [diastolic, setDiastolic] = useState(80);
  const [oxygenLevel, setOxygenLevel] = useState(98);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Calculate health status based on vitals
  const healthStatus = useMemo(() => {
    if (heartRate > 120 || heartRate < 50 || systolic > 140 || diastolic > 90 || oxygenLevel < 95) {
      return { status: 'Warning', color: 'text-yellow-500' };
    }
    if (heartRate > 100 || systolic > 130 || diastolic > 85 || oxygenLevel < 97) {
      return { status: 'Elevated', color: 'text-orange-500' };
    }
    return { status: 'Normal', color: 'text-green-500' };
  }, [heartRate, systolic, diastolic, oxygenLevel]);

  useEffect(() => {
    socket.on('pulseData', (data) => {
      setPulseHistory(prev => [...prev.slice(1), data]);
      setLabels(prev => [...prev.slice(1), '']);
      setLastUpdate(new Date());
      
      // Calculate heart rate from the last 10 seconds of pulse data
      const recentPulses = pulseHistory.slice(-10);
      const peaks = recentPulses.filter((value, index, array) => {
        return index > 0 && 
               index < array.length - 1 && 
               value > array[index - 1] && 
               value > array[index + 1] &&
               value > 500; // Threshold for peak detection
      });
      const calculatedHeartRate = Math.round((peaks.length * 6)); // Multiply by 6 to get BPM
      setHeartRate(calculatedHeartRate || heartRate);

      // Simulate other vital signs changes
      if (Math.random() < 0.1) {
        setSystolic(prev => prev + Math.random() * 2 - 1);
        setDiastolic(prev => prev + Math.random() * 2 - 1);
        setOxygenLevel(prev => Math.min(100, Math.max(94, prev + Math.random() * 0.4 - 0.2)));
      }
    });

    return () => {
      socket.off('pulseData');
    };
  }, [pulseHistory, heartRate]);

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: 'Pulse',
        data: pulseHistory,
        borderColor: '#00ff00',
        backgroundColor: 'rgba(0, 255, 0, 0.1)',
        pointRadius: 0,
        borderWidth: 1,
        tension: 0.4,
        fill: true,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 0 },
    interaction: { intersect: false },
    scales: {
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        ticks: { color: '#00ff00' },
        min: 0,
        max: 1023,
      },
      x: {
        grid: { display: false },
        ticks: { display: false }
      }
    },
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: { enabled: false }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Pulse Monitor */}
        <div className="lg:col-span-2 bg-black rounded-xl p-6 shadow-lg">
          <h2 className="text-green-500 text-xl font-bold mb-4">Real-time Pulse Monitor</h2>
          <div className="h-[400px]">
            <Line data={chartData} options={options} />
          </div>
        </div>

        {/* Vital Stats Panel */}
        <div className="bg-black rounded-xl p-6 shadow-lg">
          <h2 className="text-green-500 text-xl font-bold mb-4">Vital Statistics</h2>
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-gray-800 pb-4">
              <span className="text-gray-400">Heart Rate</span>
              <span className="text-2xl font-bold text-green-500">{heartRate} BPM</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-800 pb-4">
              <span className="text-gray-400">Blood Pressure</span>
              <span className="text-2xl font-bold text-green-500">{Math.round(systolic)}/{Math.round(diastolic)}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-800 pb-4">
              <span className="text-gray-400">Oxygen Level</span>
              <span className="text-2xl font-bold text-green-500">{Math.round(oxygenLevel)}%</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-800 pb-4">
              <span className="text-gray-400">Status</span>
              <span className={`text-2xl font-bold ${healthStatus.color}`}>{healthStatus.status}</span>
            </div>
          </div>
        </div>

        {/* Health Indicators */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-black rounded-xl p-6 shadow-lg">
            <h3 className="text-gray-400 mb-2">Heart Health Index</h3>
            <div className={`text-3xl font-bold ${
              heartRate > 100 ? 'text-red-500' : 
              heartRate < 60 ? 'text-yellow-500' : 
              'text-green-500'
            }`}>
              {heartRate > 100 ? 'High' : heartRate < 60 ? 'Low' : 'Normal'}
            </div>
          </div>

          <div className="bg-black rounded-xl p-6 shadow-lg">
            <h3 className="text-gray-400 mb-2">Blood Pressure Status</h3>
            <div className={`text-3xl font-bold ${
              systolic > 140 || diastolic > 90 ? 'text-red-500' : 
              systolic > 130 || diastolic > 85 ? 'text-yellow-500' : 
              'text-green-500'
            }`}>
              {systolic > 140 || diastolic > 90 ? 'High' : 
               systolic > 130 || diastolic > 85 ? 'Elevated' : 'Normal'}
            </div>
          </div>

          <div className="bg-black rounded-xl p-6 shadow-lg">
            <h3 className="text-gray-400 mb-2">Last Updated</h3>
            <div className="text-blue-500 text-lg">
              {lastUpdate.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PulseMonitor;
