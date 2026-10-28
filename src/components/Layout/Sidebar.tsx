import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';
import EssG from '../../assets/files/images/logo/EssG.png';

import { getVisibleNavItems, isNavActive } from '@/constants';
import { useAuth } from '@/contexts';
import { useNavigationPending } from '@/hooks';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { isAdmin, hasPermission } = useAuth();
  const { isPending, startNavigation } = useNavigationPending();
  const items = getVisibleNavItems({ isAdmin, hasPermission });

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-ink-100 bg-card lg:flex">
      <div className="flex h-16 shrink-0 items-center border-b border-ink-100 px-5">
        <Link to="/" className="flex items-center" aria-label="Accueil ESSG">
          <img src={EssG} alt="Logo ESSG" className="h-12 w-auto object-contain" />
        </Link>
      </div>

      <nav
        className="flex-1 space-y-1 overflow-y-auto px-3 py-2"
        aria-label="Navigation principale"
      >
        {items.map((item) => {
          const Icon = item.icon;
          const active = isNavActive(item.href, location.pathname);
          const pending = isPending(item.href);

          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={(event) => startNavigation(item.href, event)}
              aria-current={active ? 'page' : undefined}
              aria-busy={pending || undefined}
              className={`group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 ${
                active
                  ? 'bg-brand-600 text-white shadow-[0_8px_20px_-8px_rgba(46,106,95,0.7)]'
                  : 'text-ink-600 hover:bg-brand-100 hover:text-brand-800'
              }`}
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                  active
                    ? 'text-white'
                    : 'text-ink-500 group-hover:bg-brand-100 group-hover:text-brand-700'
                }`}
              >
                {pending ? (
                  <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
                ) : (
                  <Icon className="size-5" />
                )}
              </span>
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
