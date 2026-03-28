'use client';

import { useState, useEffect } from 'react';
import { StatsCard } from '@/components/StatsCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AdminPage() {
  const [stats, setStats] = useState({
    total_users: 0,
    total_translations: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
    } else if (user && user.role === 'admin') {
      fetchStats();
    }
  }, [user, router]);

  const fetchStats = async () => {
    try {
      setLoading(true);

      const { count: usersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      const { count: translationsCount } = await supabase
        .from('translations')
        .select('*', { count: 'exact', head: true });

      setStats({
        total_users: usersCount || 0,
        total_translations: translationsCount || 0,
      });
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        </div>
      )}
    </div>
  );
}
