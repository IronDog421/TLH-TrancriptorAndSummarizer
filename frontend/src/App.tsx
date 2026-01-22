import React,
{
useState
}
from 'react';
import axios from 'axios';
import Dropzone from './components/Dropzone';
import Status from './components/Status';
import Result from './components/Result';

type ProcessStatus = 'waiting' | 'uploading' | 'processing' | 'transcribing' | 'summarizing' | 'completed' | 'error';

function App() {
  const [status, setStatus] = useState<ProcessStatus>('waiting');
  const [transcription, setTranscription] = useState('');
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');

  const handleFile = async (file: File) => {
    setStatus('uploading');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/process-media', formData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            if (percentCompleted === 100) {
              setStatus('processing');
            }
          }
        },
      });

      setTranscription(response.data.transcription);
      setSummary(response.data.summary);
      setStatus('completed');
    } catch (error: any) {
      setError(error.response?.data?.detail || 'An unknown error occurred.');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl font-bold text-center mb-8">Media Summarizer</h1>
        {status === 'waiting' && <Dropzone onFile={handleFile} />}
        {status !== 'waiting' && <Status status={status} />}
        {status === 'completed' && <Result summary={summary} transcription={transcription} />}
        {status === 'error' && <div className="text-red-500 mt-4">{error}</div>}
      </div>
    </div>
  );
}

export default App;
