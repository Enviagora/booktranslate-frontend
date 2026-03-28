'use client';

import React, { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';
import type { Translation } from '@/types';
import { LoadingSpinner } from './LoadingSpinner';

interface TranslationProgressProps {
  translationId: string;
  onComplete?: (translation: Translation) => void;
  onError?: (error: string) => void;
}

const statusMessages = {
  uploading: 'Enviando arquivo...',
  extracting: 'Extraindo texto...',
  translating: 'Traduzindo conteúdo...',
  generating: 'Gerando arquivos...',
  completed: 'Concluído!',
  error: 'Erro na tradução',
};

export function TranslationProgress({
  translationId,
  onComplete,
  onError,
}: TranslationProgressProps) {
  const [translation, setTranslation] = useState<Translation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const fetchProgress = async () => {
      try {
        const data = await apiGet(`/translations/${translationId}`);
        setTranslation(data);
        setError(null);

        if (data.status === 'completed') {
          setLoading(false);
          onComplete?.(data);
          if (interval) clearInterval(interval);
        } else if (data.status === 'error') {
          setLoading(false);
          setError(data.status_message || 'Erro desconhecido');
          onError?.(data.status_message || 'Erro desconhecido');
          if (interval) clearInterval(interval);
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Erro ao buscar progresso';
        setError(message);
        onError?.(message);
        setLoading(false);
        if (interval) clearInterval(interval);
      }
    };

    fetchProgress();

    // Poll every 2 seconds
    interval = setInterval(fetchProgress, 2000);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [translationId, onComplete, onError]);

  if (loading && !translation) {
    return (
      <div className="space-y-4">
        <LoadingSpinner />
        <p className="text-gray-600 text-center">Carregando progresso...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-4">
        <p className="text-sm font-medium text-red-800">{error}</p>
      </div>
    );
  }

  if (!translation) {
    return null;
  }

  const statusMessage =
    statusMessages[translation.status] || 'Processando...';
  const displayProgress =
    translation.status === 'completed' ? 100 : translation.progress;

  return (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between mb-2">
          <p className="text-sm font-medium text-gray-900">{statusMessage}</p>
          <span className="text-sm text-gray-600">{displayProgress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gray-900 h-2 rounded-full transition-all duration-300"
            style={{ width: `${displayProgress}%` }}
          ></div>
        </div>
      </div>

      {translation.status_message && translation.status === 'error' && (
        <p className="text-sm text-red-600">{translation.status_message}</p>
      )}

      {translation.status === 'completed' && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4">
          <p className="text-sm font-medium text-green-800">
            Tradução concluída com sucesso!
          </p>
        </div>
      )}
    </div>
  );
}
