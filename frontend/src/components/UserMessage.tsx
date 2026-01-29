import React from 'react';
import Waveform from './Waveform';
import { Play } from 'lucide-react';

interface UserMessageProps {
  fileName?: string;
  fileUrl?: string;
  fileType?: 'audio' | 'video';
}

const UserMessage: React.FC<UserMessageProps> = ({
  fileName,
  fileUrl,
  fileType,
}) => {
  return (
    <div className="max-w-sm rounded-2xl shadow-md bg-blue-500 text-white overflow-hidden">
      {fileUrl && fileType === 'video' && (
        <div className="relative">
          <video src={fileUrl} className="w-full h-auto" />
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
            <Play size={48} className="text-white" />
          </div>
        </div>
      )}

      {fileUrl && fileType === 'audio' && (
        <div className="p-4">
          <Waveform url={fileUrl} />
        </div>
      )}

      <div className="p-3">
        <p className="font-semibold text-sm truncate">{fileName}</p>
      </div>
    </div>
  );
};

export default UserMessage;
