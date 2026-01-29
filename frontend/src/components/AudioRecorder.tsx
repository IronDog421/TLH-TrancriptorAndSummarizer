// /home/ruiz/Repositories/TLH-TrancriptorAndSummarizer/frontend/src/components/AudioRecorder.tsx

import React, { useState, useRef } from 'react';
import { Mic, Square } from 'lucide-react';

interface AudioRecorderProps {
  onFile: (file: File) => void;
  disabled?: boolean;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onFile, disabled }) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const file = new File([blob], 'recording.webm', { type: 'audio/webm' });
        onFile(file);
        
        // Detener todos los tracks para liberar el micrófono
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('No se pudo acceder al micrófono. Por favor verifica los permisos.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <button
      onClick={isRecording ? stopRecording : startRecording}
      disabled={disabled}
      className={`p-3 rounded-full transition-all duration-200 flex items-center justify-center ${
        isRecording
          ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse shadow-lg ring-2 ring-red-300'
          : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={isRecording ? 'Detener grabación' : 'Iniciar grabación'}
      type="button"
    >
      {isRecording ? <Square size={20} fill="currentColor" /> : <Mic size={20} />}
    </button>
  );
};

export default AudioRecorder;
