'use client';

import { useState, useEffect } from 'react';
import { UploadZone } from '@/components/UploadZone';
import { StatsCard } from '@/components/StatsCard';
import { StatusBadge } from '@/components/StatusBadge';
import type { Translation } from '@/types';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [stats, setStats] = useState({
    total_translations: 0,
    total_tokens: 0,
  });
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const { data: translationsData, error: translationsError } = await supabase
        .from('translations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (translationsError) throw translationsError;

      const { count } = await supabase
        .from('translations')
        .select('*', { count: 'exact', head: true });

      setTranslations(translationsData || []);
      setStats({
        total_translations: count || 0,
        total_tokens: 0,
      });
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar dados';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file: File) => {
    try {
      setUploading(true);
      setError(null);

      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('translations')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('translations')
        .getPublicUrl(fileName);

      const { error: insertError } = await supabase
        .from('translations')
        .insert({
          user_id: user.id,
          original_filename: file.name,
          file_url: publicUrl,
          status: 'pending',
          source_language: 'en',
          target_language: 'pt',
        });

      if (insertError) throw insertError;

      await fetchData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao enviar arquivo';
      setError(message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Painel</h1>
        <p className="text-gray-600">Bem-vindo ao BookTranslate</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Enviar Novo Arquivo
        </h2>
        <UploadZone onUpload={handleUpload} isLoading={uploading} />
      </div>

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

        {loading ? (
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
                      Idiomas
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
                        {new Date(translation.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {translation.source_language} → {translation.target_language}
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
