import { useState, useEffect } from 'react';

const pqrstTemplate = [
  500, 500, 500, 500, 550, 600, 550, 500, 500, 400,
  1500, 300, 500, 500, 550, 650, 700, 650, 550,
  500, 500, 500, 500, 500, 500
];

export const useSimulationData = (isEnabled) => {
  const [dataEKG, setDataEKG] = useState(Array(100).fill(500));
  const [bpm, setBpm] = useState('--');
  const [spo2, setSpo2] = useState('--');

  useEffect(() => {
    if (!isEnabled) return;

    let step = 0;
    const interval = setInterval(() => {
      const nilaiDasar = pqrstTemplate[step % pqrstTemplate.length];
      const noise = Math.random() * 30 - 15; 
      const nilaiFinal = nilaiDasar + noise;

      setDataEKG((dataLama) => {
        const newData = [...dataLama];
        newData.shift();
        newData.push(nilaiFinal);
        return newData;
      });

      if (step % pqrstTemplate.length === 0) {
        setBpm(Math.floor(Math.random() * (85 - 75 + 1)) + 75);
        setSpo2(Math.floor(Math.random() * (100 - 97 + 1)) + 97);
      }
      step++;
    }, 40); 

    return () => clearInterval(interval);
  }, [isEnabled]);

  return { bpm, spo2, dataEKG };
};