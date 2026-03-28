'use client';

import { useState, useEffect } from 'react';
import { apiGet } from '@/lib/api';
import type { AdminStats } from '@/types';
import { StatsCard } from '@/components/StatsCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await apiGet('/admin/stats');
      setStats(data);
      setError(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao carregar estatísticas';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Visão Geral da Administração
        </h1>
        <p className="text-gray-600">Estatísticas gerais do sistema</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Usuários Totais"
              value={stats.total_users}
              subtitle="Contas cadastradas"
            />
            <StatsCard
              title="Traduções Totais"
              value={stats.total_translations}
              subtitle="Processadas no sistema"
            />
            <StatsCard
              title="Tokens Totais"
              value={stats.total_tokens.toLocaleString()}
              subtitle="Utilizados em traduções"
            />
            <StatsCard
              title="Custo Total"
              value={`$${stats.total_cost_usd.toFixed(2)}`}
              subtitle="Gasto em traduções"
            />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Custos por Usuário
            </h2>

            {stats.users_stats.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Nenhum dado de usuário</p>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Traduções
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Tokens
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Custo (USD)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {stats.users_stats.map((userStat) => (
                        <tr key={userStat.user_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {userStat.email}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {userStat.translations_count}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {userStat.total_tokens.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            ${userStat.total_cost_usd.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
