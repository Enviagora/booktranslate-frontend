'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Sidebar() {
  const { user } = useAuth();
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  const userLinks = [
    { href: '/dashboard', label: 'Painel' },
    { href: '/dashboard/history', label: 'Histórico' },
  ];

  const adminLinks =
    user?.role === 'admin'
      ? [
          { href: '/dashboard/admin', label: 'Visão Geral Admin' },
          { href: '/dashboard/admin/users', label: 'Usuários' },
          { href: '/dashboard/admin/translations', label: 'Traduções' },
        ]
      : [];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-[calc(100vh-73px)] overflow-y-auto">
      <nav className="p-6">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-gray-900">BookTranslate</h1>
        </div>

        <div className="space-y-1 mb-8">
          {userLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {adminLinks.length > 0 && (
          <>
            <div className="border-t border-gray-200 my-4"></div>
            <div className="mb-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-2">
                Administração
              </p>
            </div>
            <div className="space-y-1">
              {adminLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </>
        )}
      </nav>
    </aside>
  );
}
