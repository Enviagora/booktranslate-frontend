'use client';

import React, { useState, useRef } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface UploadZoneProps {
  onUpload: (file: File) => void;
  isLoading?: boolean;
}

export function UploadZone({ onUpload, isLoading = false }: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (file.type !== 'application/pdf') {
      return 'Apenas arquivos PDF são permitidos';
    }
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      return 'O arquivo não pode ser maior que 100MB';
    }
    return null;
  };

  const handleFile = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    onUpload(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
        isDragOver
          ? 'border-gray-400 bg-gray-50'
          : 'border-gray-300 hover:border-gray-400'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={isLoading}
      />

      {isLoading ? (
        <div className="space-y-4">
          <LoadingSpinner />
          <p className="text-gray-600">Enviando arquivo...</p>
        </div>
      ) : (
        <>
          <div className="text-4xl mb-4">📄</div>
          <p className="text-lg font-medium text-gray-900 mb-2">
            Arraste um PDF aqui ou clique para selecionar
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Máximo 100MB por arquivo
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-block px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            Selecionar Arquivo
          </button>
        </>
      )}

      {error && <p className="text-red-600 text-sm mt-4">{error}</p>}
    </div>
  );
}
