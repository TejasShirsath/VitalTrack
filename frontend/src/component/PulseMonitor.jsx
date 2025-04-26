import React, { useEffect, useState } from 'react';
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

const socket = io('http://localhost:3001');

function PulseMonitor() {
  const [pulseHistory, setPulseHistory] = useState(Array(100).fill(0));
  const [labels, setLabels] = useState(Array(100).fill(''));

  useEffect(() => {
    socket.on('pulseData', (data) => {
      setPulseHistory(prev => [...prev.slice(1), data]);
      setLabels(prev => [...prev.slice(1), '']);
    });

    return () => {
      socket.off('pulseData');
    };
  }, []);

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: 'Pulse',
        data: pulseHistory,
        borderColor: '#00ff00',
        backgroundColor: 'transparent',
        pointRadius: 0,
        borderWidth: 1,
        tension: 0,
        fill: false,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 0
    },
    interaction: {
      intersect: false
    },
    scales: {
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#00ff00'
        },
        min: 0,
        max: 1023, // Arduino analog read range
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          display: false
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: false
      },
      tooltip: {
        enabled: false
      }
    }
  };

  return (
    <div className="w-full h-screen bg-black p-4">
      <div className="w-full h-full">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}

export default PulseMonitor;
