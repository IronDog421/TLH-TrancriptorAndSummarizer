import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface DropzoneProps {
  onFile: (file: File) => void;
}

const Dropzone: React.FC<DropzoneProps> = ({ onFile }) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFile(acceptedFiles[0]);
      }
    },
    [onFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: 'video/*,audio/*',
  });

  return (
    <div
      {...getRootProps()}
      className={`p-10 border-4 border-dashed rounded-lg text-center cursor-pointer
      ${isDragActive ? 'border-blue-500 bg-blue-900' : 'border-gray-600 hover:border-gray-500'}`}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p className="text-xl">Drop the file here ...</p>
      ) : (
        <p className="text-xl">Drag 'n' drop a media file here, or click to select one</p>
      )}
    </div>
  );
};

export default Dropzone;
