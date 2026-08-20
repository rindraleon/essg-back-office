import { LogOut, MoreHorizontal, X } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { routesStatic } from '../../routes';
import { getVisibleNavItems, isNavActive, PRIMARY_NAV_LABELS } from '../../constants/navigation';
import { useAuth } from '../../contexts/AuthContext';


const BottomNav: React.FC = () => {
  const [moreOpen, setMoreOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const navItems = getVisibleNavItems(user?.role);

  // Refermer le panneau « Plus » à chaque navigation
  useEffect(() => {
    setMoreOpen(false);
  }, [location.pathname]);

  const primaryItems = navItems.filter((item) => PRIMARY_NAV_LABELS.includes(item.name)).slice(0, 4);
  const moreItems = navItems.filter((item) => !PRIMARY_NAV_LABELS.includes(item.name));

  const navButtonClass = (href: string) => {
    const active = isNavActive(href, location.pathname);
    return [
      'relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl py-1.5',
      'text-[11px] font-semibold transition-colors duration-200',
      active ? 'text-brand-700' : 'text-ink-400 hover:text-brand-600',
    ].join(' ');
  };

  return (
    <>
      {/* Voile du panneau « Plus » */}
      {moreOpen && (
        <button
          type="button"
          aria-label="Fermer le menu plus"
          onClick={() => setMoreOpen(false)}
          className="fixed inset-0 z-40 bg-ink-950/40 lg:hidden border-0 p-0 cursor-pointer animate-fade-in"
        />
      )}

      {/* Panneau « Plus » (au-dessus de la bottom nav) */}
      {moreOpen && (
        <div className="fixed inset-x-0 bottom-[calc(4.25rem+env(safe-area-inset-bottom))] z-50 mx-3 rounded-2xl bg-white p-2 shadow-elevated ring-1 ring-ink-100 lg:hidden animate-slide-up safe-area-px">
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-sm font-bold text-ink-900">Plus d'options</span>
            <button
              type="button"
              onClick={() => setMoreOpen(false)}
              aria-label="Fermer"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100 transition-colors"
            >
              <X />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1.5 pb-1.5">
            {moreItems.map((item) => {
              const Icon = item.icon;
              const active = isNavActive(item.href, location.pathname);
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                    active ? 'bg-brand-50 text-brand-800' : 'text-ink-700 hover:bg-ink-50'
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                      active ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-600'
                    }`}
                  >
                    <Icon />
                  </span>
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="border-t border-ink-100 pt-1.5">
            <Link
              to={routesStatic.login}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              <LogOut />
              Retour au site
            </Link>
          </div>
        </div>
      )}

      {/* Barre de navigation fixe en bas */}
      <nav
        aria-label="Navigation principale mobile"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-ink-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90 shadow-[0_-4px_16px_rgba(15,33,30,0.06)] lg:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="mx-auto flex max-w-lg items-stretch gap-1 px-2 py-1.5">
          {primaryItems.map((item) => {
            const Icon = item.icon;
            const active = isNavActive(item.href, location.pathname);
            return (
              <Link key={item.href} to={item.href} className={navButtonClass(item.href)}>
                <span className="relative flex items-center justify-center">
                  <span
                    className={`flex h-8 w-14 items-center justify-center rounded-full transition-all duration-300 ${
                      active
                        ? 'bg-brand-600 text-white shadow-[0_6px_16px_-6px_rgba(46,106,95,0.7)]'
                        : ''
                    }`}
                  >
                    <Icon />
                  </span>
                  {active && (
                    <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-brand-600" />
                  )}
                </span>
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}

          {/* Bouton « Plus » */}
          <button
            type="button"
            onClick={() => setMoreOpen((prev) => !prev)}
            aria-expanded={moreOpen}
            aria-haspopup="menu"
            aria-label="Plus d'options"
            className={navButtonClass('__more__')}
          >
            <span className="relative flex items-center justify-center">
              <span
                className={`flex h-8 w-14 items-center justify-center rounded-full transition-all duration-300 ${
                  moreOpen ? 'bg-brand-600 text-white' : ''
                }`}
              >
                <MoreHorizontal />
              </span>
            </span>
            <span>Plus</span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default BottomNav;
