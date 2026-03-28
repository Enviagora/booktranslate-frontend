'use client';

import { useState, useEffect } from 'react';
import { apiGet, apiPost, apiDelete, apiPatch } from '@/lib/api';
import type { User } from '@/types';
import { Modal } from '@/components/Modal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [creating, setCreating] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    action: 'block' | 'unblock' | 'delete';
    userId?: string;
    userEmail?: string;
  }>({
    isOpen: false,
    action: 'block',
  });

  const { user: currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [currentUser, router]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await apiGet('/admin/users');
      setUsers(data.users || []);
      setError(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao carregar usuários';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!newUserEmail || !newUserPassword) {
      setError('Email e senha são obrigatórios');
      return;
    }

    try {
      setCreating(true);
      await apiPost('/admin/users', {
        email: newUserEmail,
        password: newUserPassword,
      });
      setNewUserEmail('');
      setNewUserPassword('');
      setIsCreateModalOpen(false);
      await fetchUsers();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao criar usuário';
      setError(message);
    } finally {
      setCreating(false);
    }
  };

  const handleBlockToggle = async (userId: string, currentlyBlocked: boolean) => {
    setConfirmDialog({
      isOpen: true,
      action: currentlyBlocked ? 'unblock' : 'block',
      userId,
      userEmail: users.find((u) => u.id === userId)?.email,
    });
  };

  const handleDelete = (userId: string) => {
    setConfirmDialog({
      isOpen: true,
      action: 'delete',
      userId,
      userEmail: users.find((u) => u.id === userId)?.email,
    });
  };

  const executeConfirmAction = async () => {
    try {
      if (confirmDialog.action === 'block') {
        await apiPatch(`/admin/users/${confirmDialog.userId}`, {
          is_blocked: true,
        });
      } else if (confirmDialog.action === 'unblock') {
        await apiPatch(`/admin/users/${confirmDialog.userId}`, {
          is_blocked: false,
        });
      } else if (confirmDialog.action === 'delete') {
        await apiDelete(`/admin/users/${confirmDialog.userId}`);
      }

      await fetchUsers();
      setConfirmDialog({ isOpen: false, action: 'block' });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao executar ação';
      setError(message);
    }
  };

  const getConfirmMessage = () => {
    const email = confirmDialog.userEmail || 'usuário';
    if (confirmDialog.action === 'block') {
      return `Tem certeza que deseja bloquear o usuário ${email}?`;
    } else if (confirmDialog.action === 'unblock') {
      return `Tem certeza que deseja desbloquear o usuário ${email}?`;
    } else {
      return `Tem certeza que deseja deletar o usuário ${email}? Esta ação não pode ser desfeita.`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Usuários</h1>
          <p className="text-gray-600">Gerenciar contas de usuários</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
        >
          Criar Usuário
        </button>
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
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Ações
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
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleBlockToggle(user.id, user.is_blocked)
                          }
                          className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                            user.is_blocked
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                          }`}
                        >
                          {user.is_blocked ? 'Desbloquear' : 'Bloquear'}
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="px-3 py-1 text-xs font-medium bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
                        >
                          Deletar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setNewUserEmail('');
          setNewUserPassword('');
          setError(null);
        }}
        title="Criar Novo Usuário"
        actions={
          <div className="flex gap-3">
            <button
              onClick={() => {
                setIsCreateModalOpen(false);
                setNewUserEmail('');
                setNewUserPassword('');
                setError(null);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleCreateUser}
              disabled={creating}
              className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50"
            >
              {creating ? 'Criando...' : 'Criar'}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              disabled={creating}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-50"
              placeholder="user@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={newUserPassword}
              onChange={(e) => setNewUserPassword(e.target.value)}
              disabled={creating}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-50"
              placeholder="••••••••"
            />
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={
          confirmDialog.action === 'block'
            ? 'Bloquear Usuário'
            : confirmDialog.action === 'unblock'
              ? 'Desbloquear Usuário'
              : 'Deletar Usuário'
        }
        message={getConfirmMessage()}
        confirmLabel={
          confirmDialog.action === 'block'
            ? 'Bloquear'
            : confirmDialog.action === 'unblock'
              ? 'Desbloquear'
              : 'Deletar'
        }
        isDangerous={confirmDialog.action === 'delete'}
        onConfirm={executeConfirmAction}
        onCancel={() => setConfirmDialog({ isOpen: false, action: 'block' })}
      />
    </div>
  );
}
