import React, { useState } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useSimulationData } from './hooks/useSimulationData';
import { useMQTTData } from './hooks/useMQTTData';

import Footer from './components/Footer.jsx';
import ToggleButton from './components/ToggleButton.jsx';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler);

function App() {
  const [isSimModeBtn, setIsSimModeBtn] = useState(false);
  const simData = useSimulationData(isSimModeBtn);      
  const mqttData = useMQTTData(!isSimModeBtn);          

  const bpm = isSimModeBtn ? simData.bpm : mqttData.bpm;
  const spo2 = isSimModeBtn ? simData.spo2 : mqttData.spo2;
  const dataEKG = isSimModeBtn ? simData.dataEKG : mqttData.dataEKG;

  const getBpmColor = (value) => {
    if (value === '--') return 'text-gray-300';
    const num = parseInt(value);
    if (num < 60) return 'text-blue-500';
    if (num <= 100) return 'text-green-500';
    return 'text-red-500';
  };

  const getSpo2Color = (value) => {
    if (value === '--') return 'text-gray-300';
    const num = parseInt(value);
    if (num >= 90) return 'text-green-500';
    if (num >= 70) return 'text-orange-500';
    return 'text-red-500';
  };

  const chartData = {
    labels: Array(100).fill(''),
    datasets: [{
      label: 'Sinyal EKG (mV)',
      data: dataEKG,
      borderColor: isSimModeBtn ? 'rgb(34, 197, 94)' : 'rgb(59, 130, 246)', 
      borderWidth: 2.5,
      pointRadius: 0,
      tension: 0.2,
    }],
  };

  const chartOptions = {
    responsive: true, maintainAspectRatio: false, animation: false,
    scales: { y: { min: 0, max: 2000, display: false }, x: { display: false } },
    plugins: { legend: { display: false } }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans flex flex-col justify-between relative pb-16">
      
      <div>
        <div className="max-w-6xl mx-auto mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-blue-900 mb-2">
            Analisis Instrumen Pemantau Detak Jantung
          </h1>
          <p className="text-gray-500 font-medium text-sm md:text-base">
            Menggunakan Sensor MAX30100 dan AD8232 berbasis ESP32 dengan Antarmuka Website
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center relative">
            <h2 className="text-gray-500 text-lg font-semibold mb-2">Detak Jantung (BPM)</h2>
            <div className={`text-6xl font-bold transition-colors duration-500 ${getBpmColor(bpm)}`}>
              {bpm}
            </div>
            <p className="text-sm text-gray-400 mt-3 mb-4">{bpm !== '--' ? 'Menerima data...' : 'Menunggu data sensor...'}</p>
            <div className="w-full pt-4 border-t border-gray-100 text-xs text-gray-500 flex flex-col gap-1">
              <div className="flex items-center justify-center gap-4">
                <div title="Rendah: Detak jantung di bawah normal (Bradikardia)" className="flex items-center gap-1 hover:text-gray-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span> &lt; 60
                </div>
                <div title="Normal: Detak jantung sehat dan optimal" className="flex items-center gap-1 hover:text-gray-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> 60 - 100
                </div>
                <div title="Tinggi: Detak jantung di atas normal (Takikardia)" className="flex items-center gap-1 hover:text-gray-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> &gt; 100
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center relative">
            <h2 className="text-gray-500 text-lg font-semibold mb-2">Saturasi Oksigen (SpO2)</h2>
            <div className={`text-6xl font-bold transition-colors duration-500 ${getSpo2Color(spo2)}`}>
              {spo2}<span className="text-4xl">%</span>
            </div>
            <p className="text-sm text-gray-400 mt-3 mb-4">{spo2 !== '--' ? 'Menerima data...' : 'Menunggu data sensor...'}</p>
            <div className="w-full pt-4 border-t border-gray-100 text-xs text-gray-500 flex flex-col gap-1">
              <div className="flex items-center justify-center gap-4">
                <div title="Normal: Kadar oksigen dalam darah sangat baik" className="flex items-center gap-1 hover:text-gray-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> &ge; 90%
                </div>
                <div title="Waspada: Kadar oksigen rendah (Hipoksia ringan-sedang)" className="flex items-center gap-1 hover:text-gray-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-400"></span> 70% - 89%
                </div>
                <div title="Bahaya: Kadar oksigen sangat rendah (Hipoksia berat)" className="flex items-center gap-1 hover:text-gray-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> &lt; 70%
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:col-span-2">
            <h2 className="text-gray-500 text-lg font-semibold mb-4 text-center">
              Grafik Gelombang Elektrokardiografi (EKG)
            </h2>
            <div className="w-full h-72 bg-black rounded-xl p-4 overflow-hidden shadow-inner relative">
              <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold text-white ${isSimModeBtn ? 'bg-green-500/50' : 'bg-blue-500/50'}`}>
                {isSimModeBtn ? 'SIMULASI' : 'SENSOR'}
              </div>
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <ToggleButton isSimMode={isSimModeBtn} toggleMode={() => setIsSimModeBtn(!isSimModeBtn)} />
      
    </div>
  );
}

export default App;