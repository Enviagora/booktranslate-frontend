import type { Translation } from '@/types';

const statusConfig = {
  pending: {
    label: 'Pendente',
    className: 'bg-gray-100 text-gray-800',
  },
  processing: {
    label: 'Processando',
    className: 'bg-blue-100 text-blue-800',
  },
  completed: {
    label: 'Concluído',
    className: 'bg-green-100 text-green-800',
  },
  error: {
    label: 'Erro',
    className: 'bg-red-100 text-red-800',
  },
};

interface StatusBadgeProps {
  status: Translation['status'];
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}
