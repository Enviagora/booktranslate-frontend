'use client';

import { useState, useEffect } from 'react';
import { apiGet } from '@/lib/api';
import type { Translation } from '@/types';
import { StatusBadge } from '@/components/StatusBadge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminTranslationsPage() {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterUser, setFilterUser] = useState<string>('');
  const [users, setUsers] = useState<{ id: string; email: string }[]>([]);

  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [translationsData, usersData] = await Promise.all([
        apiGet('/admin/translations'),
        apiGet('/admin/users'),
      ]);

      setTranslations(translationsData.translations || []);
      setUsers(usersData.users || []);
      setError(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao carregar dados';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const filteredTranslations = filterUser
    ? translations.filter((t) => t.user_id === filterUser)
    : translations;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Traduções</h1>
        <p className="text-gray-600">Todas as traduções do sistema</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <label
            htmlFor="userFilter"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Filtrar por Usuário
          </label>
          <select
            id="userFilter"
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="">Todos os usuários</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.email}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={fetchData}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Atualizar
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : filteredTranslations.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {filterUser ? 'Nenhuma tradução encontrada para este usuário' : 'Nenhuma tradução encontrada'}
          </p>
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
                    Usuário
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
                    Concluído em
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTranslations.map((translation) => (
                  <tr key={translation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {translation.original_filename}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {translation.user_email || 'Desconhecido'}
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
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {translation.completed_at
                        ? new Date(translation.completed_at).toLocaleDateString(
                          'pt-BR'
                        )
                        : '-'}
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
