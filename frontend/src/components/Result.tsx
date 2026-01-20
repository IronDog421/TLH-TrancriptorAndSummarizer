import React, { useState } from 'react';

interface ResultProps {
  summary: string;
  transcription: string;
}

const Result: React.FC<ResultProps> = ({ summary, transcription }) => {
  const [showTranscription, setShowTranscription] = useState(false);

  return (
    <div className="mt-8">
      <h2 className="text-3xl font-bold mb-4">Summary</h2>
      <div className="bg-gray-800 p-4 rounded-lg">
        <p>{summary}</p>
      </div>

      <div className="mt-8">
        <button
          onClick={() => setShowTranscription(!showTranscription)}
          className="text-xl font-bold mb-4 focus:outline-none"
        >
          {showTranscription ? 'Hide' : 'Show'} Transcription
        </button>
        {showTranscription && (
          <div className="bg-gray-800 p-4 rounded-lg max-h-96 overflow-y-auto">
            <p>{transcription}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Result;
