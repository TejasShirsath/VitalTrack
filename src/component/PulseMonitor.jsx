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

const host = 'http://localhost:3001';

const socket = io(host);

function PulseMonitor() {
  const [pulseHistory, setPulseHistory] = useState(Array(100).fill(0));
  const [bpmHistory, setBpmHistory] = useState(Array(20).fill(0));
  const [labels, setLabels] = useState(Array(100).fill(''));
  const [bpmLabels, setBpmLabels] = useState(Array(20).fill(''));
  const [heartRate, setHeartRate] = useState(0);

  // Calculate health status based on heart rate only
  const healthStatus = useMemo(() => {
    if (heartRate > 120 || heartRate < 50) {
      return { status: 'Warning', color: 'text-yellow-500' };
    }
    if (heartRate > 100) {
      return { status: 'Elevated', color: 'text-orange-500' };
    }
    return { status: 'Normal', color: 'text-green-500' };
  }, [heartRate]);

  useEffect(() => {
    socket.on('pulseData', (data) => {
      setPulseHistory(prev => [...prev.slice(1), data]);
      setLabels(prev => [...prev.slice(1), '']);
    });

    socket.on('bpmData', (bpm) => {
      setHeartRate(bpm);
      setBpmHistory(prev => [...prev.slice(1), bpm]);
      setBpmLabels(prev => [...prev.slice(1), new Date().toLocaleTimeString()]);
    });

    return () => {
      socket.off('pulseData');
      socket.off('bpmData');
    };
  }, []);

  const pulseChartData = {
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

  const bpmChartData = {
    labels: bpmLabels,
    datasets: [
      {
        label: 'BPM',
        data: bpmHistory,
        borderColor: '#ffffff',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        pointRadius: 3,
        pointBackgroundColor: '#ffffff',
        borderWidth: 2,
        tension: 0.3,
        fill: true,
      }
    ]
  };

  const pulseOptions = {
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

  const bpmOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: 'index' },
    scales: {
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        ticks: { 
          color: '#ffffff',
          font: { size: 12 },
          callback: (value) => `${value} BPM`
        },
        min: 40,
        max: 140,
        title: {
          display: true,
          text: 'Heart Rate (BPM)',
          color: '#ffffff'
        }
      },
      x: {
        grid: { 
          display: true,
          color: 'rgba(255, 255, 255, 0.05)'
        },
        ticks: { 
          color: '#ffffff',
          maxRotation: 45,
          font: { size: 10 },
          maxTicksLimit: 10
        }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        displayColors: false,
        callbacks: {
          label: (context) => `Heart Rate: ${context.parsed.y} BPM`
        }
      }
    },
    animation: {
      duration: 500
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Pulse Monitor */}
        <div className="lg:col-span-2 bg-black rounded-xl p-6 shadow-lg">
          <h2 className="text-green-500 text-xl font-bold mb-4">Real-time Pulse Monitor</h2>
          <div className="h-[400px]">
            <Line data={pulseChartData} options={pulseOptions} />
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
              <span className="text-gray-400">Status</span>
              <span className={`text-2xl font-bold ${healthStatus.color}`}>{healthStatus.status}</span>
            </div>
          </div>
        </div>

        {/* BPM Graph */}
        <div className="lg:col-span-2 bg-black rounded-xl p-6 shadow-lg">
          <h2 className="text-white text-xl font-bold mb-4">BPM History</h2>
          <div className="h-[300px]">
            <Line data={bpmChartData} options={bpmOptions} />
          </div>
        </div>

        {/* Heart Health Index */}
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
      </div>
    </div>
  );
}

export default PulseMonitor;
