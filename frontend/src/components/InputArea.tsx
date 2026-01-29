import React, { useRef } from 'react';
import { Paperclip } from 'lucide-react';

interface InputAreaProps {
  onFile: (file: File) => void;
  processing: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({ onFile, processing }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFile(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex items-center gap-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="audio/*,video/*"
        disabled={processing}
      />
      
      <button
        onClick={handleUploadClick}
        disabled={processing}
        className="p-3 rounded-full transition-all duration-200 flex items-center justify-center bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
      >
        <Paperclip size={20} />
      </button>

      <div className="flex-1 text-center text-sm text-gray-500">
        {processing ? 'Processing media...' : 'Attach an audio or video file'}
      </div>
    </div>
  );
};

export default InputArea;
