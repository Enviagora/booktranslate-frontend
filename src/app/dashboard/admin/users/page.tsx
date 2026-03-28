'use client';

import { useState, useEffect } from 'react';
import type { User } from '@/types';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user: currentUser } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') {
      router.push('/dashboard');
    } else if (currentUser && currentUser.role === 'admin') {
      fetchUsers();
    }
  }, [currentUser, router]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setUsers(data || []);
      setError(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao carregar usuários';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Usuários</h1>
        <p className="text-gray-600">Lista de todos os usuários do sistema</p>
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
      ) : users.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Nenhum usuário encontrado</p>
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
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Criado em
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.role === 'admin' ? 'Administrador' : 'Usuário'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                          user.is_blocked
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {user.is_blocked ? 'Bloqueado' : 'Ativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(user.created_at).toLocaleDateString('pt-BR')}
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
