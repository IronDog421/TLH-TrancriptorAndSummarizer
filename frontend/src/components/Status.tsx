import React from 'react';

interface StatusProps {
  status: string;
}

const Status: React.FC<StatusProps> = ({ status }) => {
  const messages: { [key: string]: string } = {
    uploading: 'Uploading...',
    processing: 'Processing audio...',
    transcribing: 'Transcribing...',
    summarizing: 'Generating summary...',
    completed: 'Completed!',
    error: 'An error occurred.',
  };

  return (
    <div className="text-center my-4">
      <p className="text-2xl">{messages[status]}</p>
      {status !== 'completed' && status !== 'error' && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mt-4"></div>
      )}
      <p className="text-sm text-gray-400 mt-2">This process may take a few minutes. Please be patient.</p>
    </div>
  );
};

export default Status;
