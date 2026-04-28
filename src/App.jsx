import React, { useState, useEffect } from 'react';
import { useSimulationData } from './hooks/useSimulationData';
import { useMQTTData } from './hooks/useMQTTData';

import Footer from './components/Footer.jsx';
import ToggleButton from './components/ToggleButton.jsx';

function App() {
  const [isSimModeBtn, setIsSimModeBtn] = useState(false);
  const simData = useSimulationData(isSimModeBtn);      
  const mqttData = useMQTTData(!isSimModeBtn);          

  const bpm = isSimModeBtn ? simData.bpm : mqttData.bpm;
  const spo2 = isSimModeBtn ? simData.spo2 : mqttData.spo2;

  // STATE BARU: Untuk menyimpan riwayat log data
  const [history, setHistory] = useState([]);

  // EFFECT BARU: Menangkap data masuk dan menyimpannya ke history dengan timestamp
  useEffect(() => {
    // Hanya simpan data jika bukan "--" (sedang loading) dan bukan 0
    if (bpm !== '--' && bpm !== 0 && spo2 !== '--' && spo2 !== 0) {
      const newEntry = {
        waktu: new Date().toLocaleTimeString('id-ID'), // Format jam:menit:detik
        nilaiBpm: bpm,
        nilaiSpo2: spo2
      };

      // Tambahkan ke posisi paling atas, batasi maksimal 15 baris data agar tabel tidak kepanjangan
      setHistory(prev => [newEntry, ...prev].slice(0, 15));
    }
  }, [bpm, spo2]);

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

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans flex flex-col justify-between relative pb-16">
      
      <div>
        <div className="max-w-6xl mx-auto mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-blue-900 mb-2">
            Analisis Instrumen Pemantau Detak Jantung
          </h1>
          <p className="text-gray-500 font-medium text-sm md:text-base">
            Menggunakan Sensor MAX30102 Berbasis ESP32 dengan Antarmuka Website
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card BPM */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center relative">
            <h2 className="text-gray-500 text-lg font-semibold mb-2">Detak Jantung (BPM)</h2>
            <div className={`text-6xl font-bold transition-colors duration-500 ${getBpmColor(bpm)}`}>
              {bpm}
            </div>
            <p className="text-sm text-gray-400 mt-3 mb-4">{bpm !== '--' ? 'Menerima data...' : 'Menunggu data sensor...'}</p>
            <div className="w-full pt-4 border-t border-gray-100 text-xs text-gray-500 flex flex-col gap-1">
              <div className="flex items-center justify-center gap-4">
                <div title="Rendah: Detak jantung di bawah normal" className="flex items-center gap-1 hover:text-gray-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span> &lt; 60
                </div>
                <div title="Normal: Detak jantung sehat dan optimal" className="flex items-center gap-1 hover:text-gray-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> 60 - 100
                </div>
                <div title="Tinggi: Detak jantung di atas normal" className="flex items-center gap-1 hover:text-gray-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> &gt; 100
                </div>
              </div>
            </div>
          </div>

          {/* Card SpO2 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center relative">
            <h2 className="text-gray-500 text-lg font-semibold mb-2">Saturasi Oksigen (SpO2)</h2>
            <div className={`text-6xl font-bold transition-colors duration-500 ${getSpo2Color(spo2)}`}>
              {spo2}<span className="text-4xl">%</span>
            </div>
            <p className="text-sm text-gray-400 mt-3 mb-4">{spo2 !== '--' ? 'Menerima data...' : 'Menunggu data sensor...'}</p>
            <div className="w-full pt-4 border-t border-gray-100 text-xs text-gray-500 flex flex-col gap-1">
              <div className="flex items-center justify-center gap-4">
                <div title="Normal: Kadar oksigen sangat baik" className="flex items-center gap-1 hover:text-gray-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> &ge; 90%
                </div>
                <div title="Waspada: Kadar oksigen rendah" className="flex items-center gap-1 hover:text-gray-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-400"></span> 70% - 89%
                </div>
                <div title="Bahaya: Kadar oksigen sangat rendah" className="flex items-center gap-1 hover:text-gray-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> &lt; 70%
                </div>
              </div>
            </div>
          </div>

          {/* Komponen Log Riwayat Pengganti Grafik EKG */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:col-span-2">
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
              <h2 className="text-gray-500 text-lg font-semibold">
                Log Riwayat Pembacaan Sensor
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400">STATUS:</span>
                <span className={`px-2 py-1 rounded text-xs font-bold text-white ${isSimModeBtn ? 'bg-orange-400' : 'bg-emerald-500'}`}>
                  {isSimModeBtn ? 'MODE SIMULASI' : 'LIVE SENSOR'}
                </span>
                {!isSimModeBtn && bpm !== '--' && (
                  <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse ml-1"></span>
                )}
              </div>
            </div>

            <div className="w-full bg-slate-50 rounded-xl overflow-hidden shadow-inner border border-gray-200">
              <div className="max-h-72 overflow-y-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-slate-200 sticky top-0 z-10">
                    <tr className="text-slate-600">
                      <th className="py-3 px-4 font-bold border-b border-slate-300">Waktu (Timestamp)</th>
                      <th className="py-3 px-4 font-bold border-b border-slate-300 text-center">Detak Jantung (BPM)</th>
                      <th className="py-3 px-4 font-bold border-b border-slate-300 text-center">Saturasi (SpO2)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {history.length > 0 ? (
                      history.map((item, index) => (
                        <tr key={index} className="hover:bg-blue-50 transition-colors duration-150 bg-white">
                          <td className="py-3 px-4 text-gray-500 font-mono text-sm">{item.waktu}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`font-bold ${getBpmColor(item.nilaiBpm)}`}>{item.nilaiBpm}</span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`font-bold ${getSpo2Color(item.nilaiSpo2)}`}>{item.nilaiSpo2}%</span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="py-12 text-center text-gray-400 italic">
                          Belum ada data masuk. Tempelkan jari pada sensor...
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
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