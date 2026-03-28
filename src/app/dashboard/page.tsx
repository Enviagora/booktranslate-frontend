'use client';

import { useState, useEffect } from 'react';
import { UploadZone } from '@/components/UploadZone';
import { TranslationProgress } from '@/components/TranslationProgress';
import { StatsCard } from '@/components/StatsCard';
import { StatusBadge } from '@/components/StatusBadge';
import { apiGet, apiPost } from '@/lib/api';
import type { Translation } from '@/types';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function DashboardPage() {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [stats, setStats] = useState({
    total_translations: 0,
    total_tokens: 0,
  });
  const [uploading, setUploading] = useState(false);
  const [currentTranslationId, setCurrentTranslationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [translationsData, statsData] = await Promise.all([
        apiGet('/translations?limit=5'),
        apiGet('/user/stats'),
      ]);

      setTranslations(translationsData.translations || []);
      setStats({
        total_translations: statsData.translations_count || 0,
        total_tokens: statsData.total_tokens || 0,
      });
      setError(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao carregar dados';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file: File) => {
    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/translations`,
        {
          method: 'POST',
          body: formData,
          headers: {
            Authorization: `Bearer ${await getAuthToken()}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao enviar arquivo');
      }

      const data = await response.json();
      setCurrentTranslationId(data.id);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao enviar arquivo';
      setError(message);
    } finally {
      setUploading(false);
    }
  };

  const handleTranslationComplete = async () => {
    setCurrentTranslationId(null);
    await fetchData();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Painel</h1>
        <p className="text-gray-600">Bem-vindo ao BookTranslate</p>
      </div>

      {error && !currentTranslationId && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {currentTranslationId ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Tradução em Progresso
          </h2>
          <TranslationProgress
            translationId={currentTranslationId}
            onComplete={handleTranslationComplete}
          />
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Enviar Novo Arquivo
          </h2>
          <UploadZone onUpload={handleUpload} isLoading={uploading} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatsCard
          title="Traduções Totais"
          value={stats.total_translations}
          subtitle="Desde a criação da conta"
        />
        <StatsCard
          title="Tokens Utilizados"
          value={stats.total_tokens.toLocaleString()}
          subtitle="Total processado"
        />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Traduções Recentes
        </h2>

        {loading && !translations.length ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : translations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhuma tradução ainda</p>
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {translations.map((translation) => (
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
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
