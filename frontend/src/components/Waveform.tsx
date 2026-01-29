import React, { useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';

interface WaveformProps {
  url: string;
}

const Waveform: React.FC<WaveformProps> = ({ url }) => {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);

  useEffect(() => {
    if (waveformRef.current) {
      wavesurferRef.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: 'rgb(209 213 219)',
        progressColor: 'rgb(59 130 246)',
        url: url,
        barWidth: 2,
        barGap: 1,
        height: 64,
      });
    }

    return () => {
      wavesurferRef.current?.destroy();
    };
  }, [url]);

  return <div ref={waveformRef} />;
};

export default Waveform;
