import React, { useState } from 'react';

interface AssistantMessageProps {
  summary?: string;
  transcription?: string;
}

const AssistantMessage: React.FC<AssistantMessageProps> = ({ summary, transcription }) => {
  const [showTranscription, setShowTranscription] = useState(false);

  return (
    <div className="max-w-xl p-4 rounded-2xl shadow-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
      {summary && (
        <>
          <h3 className="font-semibold mb-1">Summary:</h3>
          <p className="text-sm whitespace-pre-wrap">{summary}</p>
        </>
      )}
      {transcription && (
        <div className="mt-2">
          <button
            className="text-xs text-blue-400 underline"
            onClick={() => setShowTranscription(!showTranscription)}
          >
            {showTranscription ? 'Hide' : 'Show'} transcription
          </button>
          {showTranscription && (
            <pre className="text-xs bg-gray-200 dark:bg-gray-700 p-2 rounded mt-1 whitespace-pre-wrap">
              {transcription}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};

export default AssistantMessage;
