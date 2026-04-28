import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { useMQTTData } from './hooks/useMQTTData';

import Footer from './components/Footer.jsx';

function App() {
  const mqttData = useMQTTData(true);          

  const bpm = mqttData.bpm;
  const spo2 = mqttData.spo2;

  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (bpm !== '--' && bpm !== 0 && spo2 !== '--' && spo2 !== 0) {
      const newEntry = {
        waktu: new Date().toLocaleTimeString('id-ID'),
        nilaiBpm: bpm,
        nilaiSpo2: spo2
      };

      setHistory(prev => [newEntry, ...prev]);
    }
  }, [bpm, spo2]);

  const exportToExcel = () => {
    if (history.length === 0) {
      alert("Belum ada data untuk diunduh!");
      return;
    }

    const historyKronologis = [...history].reverse();

    const dataUntukExcel = historyKronologis.map((item, index) => ({
      "No": index + 1,
      "Waktu": item.waktu,
      "Detak Jantung (BPM)": item.nilaiBpm,
      "Saturasi Oksigen (SpO2 %)": item.nilaiSpo2
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataUntukExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Medis");

    const fileName = `Data_Medis_${new Date().toLocaleDateString('id-ID').replace(/\//g, '-')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

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
            Instrumen Pemantau Detak Jantung
          </h1>
          <p className="text-gray-500 font-medium text-sm md:text-base">
            Menggunakan Sensor MAX30102 Berbasis ESP32
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
                <div title="Rendah" className="flex items-center gap-1 hover:text-gray-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span> &lt; 60
                </div>
                <div title="Normal" className="flex items-center gap-1 hover:text-gray-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> 60 - 100
                </div>
                <div title="Tinggi" className="flex items-center gap-1 hover:text-gray-700">
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
                <div title="Normal" className="flex items-center gap-1 hover:text-gray-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> &ge; 90%
                </div>
                <div title="Waspada" className="flex items-center gap-1 hover:text-gray-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-400"></span> 70% - 89%
                </div>
                <div title="Bahaya" className="flex items-center gap-1 hover:text-gray-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> &lt; 70%
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:col-span-2">
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 border-b border-gray-100 pb-3 gap-3">
              <h2 className="text-gray-500 text-lg font-semibold">
                Log Riwayat Pembacaan Sensor
              </h2>
              <div className="flex items-center gap-3">
                <button 
                  onClick={exportToExcel}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  UNDUH EXCEL
                </button>
              </div>
            </div>

            <div className="w-full bg-slate-50 rounded-xl overflow-hidden shadow-inner border border-gray-200">
              <div className="max-h-72 overflow-y-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-slate-200 sticky top-0 z-10">
                    <tr className="text-slate-600">
                      <th className="py-3 px-4 font-bold border-b border-slate-300">Waktu (Timestamp)</th>
                      <th className="py-3 px-4 font-bold border-b border-slate-300 text-center">Detak Jantung (BPM)</th>
                      <th className="py-3 px-4 font-bold border-b border-slate-300 text-center">Saturasi Oksigen (SpO2)</th>
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
    </div>
  );
}

export default App;