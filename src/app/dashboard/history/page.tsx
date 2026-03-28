'use client';

import { useState, useEffect } from 'react';
import { apiGet, apiPost } from '@/lib/api';
import type { Translation } from '@/types';
import { StatusBadge } from '@/components/StatusBadge';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function HistoryPage() {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'status'>('date');
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    fetchTranslations();
  }, []);

  const fetchTranslations = async () => {
    try {
      setLoading(true);
      const data = await apiGet('/translations');
      setTranslations(data.translations || []);
      setError(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao carregar histórico';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const sortedTranslations = [...translations].sort((a, b) => {
    if (sortBy === 'date') {
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } else {
      return a.status.localeCompare(b.status);
    }
  });

  const handleDownload = async (
    translationId: string,
    type: 'pdf' | 'epub'
  ) => {
    try {
      setDownloading(`${translationId}-${type}`);

      const endpoint =
        type === 'pdf'
          ? `/translations/${translationId}/download-pdf`
          : `/translations/${translationId}/download-epub`;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${await getAuthToken()}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Erro ao baixar arquivo ${type.toUpperCase()}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const translation = translations.find((t) => t.id === translationId);
      const filename = translation
        ? `${translation.original_filename.replace('.pdf', '')}.${type}`
        : `traduzido.${type}`;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao baixar arquivo';
      setError(message);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Histórico</h1>
        <p className="text-gray-600">Todas as suas traduções</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={() => setSortBy('date')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              sortBy === 'date'
                ? 'bg-gray-900 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Ordenar por Data
          </button>
          <button
            onClick={() => setSortBy('status')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              sortBy === 'status'
                ? 'bg-gray-900 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Ordenar por Status
          </button>
        </div>

        <button
          onClick={fetchTranslations}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Atualizar
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : sortedTranslations.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Nenhuma tradução encontrada</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Arquivo
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Páginas
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Tokens
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Custo (USD)
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedTranslations.map((translation) => (
                  <tr key={translation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {translation.original_filename}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <StatusBadge status={translation.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(translation.created_at).toLocaleDateString(
                        'pt-BR'
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {translation.pages_count}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {translation.total_tokens.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      ${translation.cost_usd.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {translation.status === 'completed' ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleDownload(translation.id, 'pdf')
                            }
                            disabled={
                              downloading === `${translation.id}-pdf`
                            }
                            className="px-3 py-1 text-xs font-medium bg-gray-900 text-white rounded hover:bg-gray-800 disabled:opacity-50 transition-colors"
                          >
                            {downloading === `${translation.id}-pdf`
                              ? 'Baixando...'
                              : 'PDF'}
                          </button>
                          <button
                            onClick={() =>
                              handleDownload(translation.id, 'epub')
                            }
                            disabled={
                              downloading === `${translation.id}-epub`
                            }
                            className="px-3 py-1 text-xs font-medium bg-gray-900 text-white rounded hover:bg-gray-800 disabled:opacity-50 transition-colors"
                          >
                            {downloading === `${translation.id}-epub`
                              ? 'Baixando...'
                              : 'EPUB'}
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-xs">
                          Processando...
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

async function getAuthToken(): Promise<string> {
  const { createClient } = await import('@/lib/supabase/client');
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Não autenticado');
  }
  return session.access_token;
}
