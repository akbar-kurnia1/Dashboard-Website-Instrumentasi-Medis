import { useState, useEffect } from 'react';
import mqtt from 'mqtt';

export const useMQTTData = (isEnabled) => {
  const [dataEKG, setDataEKG] = useState(Array(100).fill(500));
  const [bpm, setBpm] = useState('--');
  const [spo2, setSpo2] = useState('--');

  useEffect(() => {
    if (!isEnabled) return;

    const client = mqtt.connect('wss://broker.hivemq.com:8884/mqtt');

    client.on('connect', () => {
      console.log('Frontend Terhubung ke MQTT Broker!');
      client.subscribe('kelompok1/medis/data');
    });

    client.on('message', (topic, message) => {
      try {
        const payload = JSON.parse(message.toString());
        if(payload.bpm) setBpm(payload.bpm);
        if(payload.spo2) setSpo2(payload.spo2);
        if(payload.ekg) {
          setDataEKG((dataLama) => {
            const newData = [...dataLama];
            newData.shift();
            newData.push(payload.ekg);
            return newData;
          });
        }
      } catch (error) {
        console.error("Format data gagal dibaca:", error);
      }
    });

    return () => client.end();
  }, [isEnabled]);

  return { bpm, spo2, dataEKG };
};