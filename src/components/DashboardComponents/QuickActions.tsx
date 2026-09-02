import { CircleHelp, Plus, RefreshCw, Settings } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { routesStatic } from '../../routes';

const ACTION_STYLES = {
  iconBg: 'bg-brand-50 text-brand-600 group-hover:bg-brand-600 group-hover:text-white',
};

const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  const actions = [
    {
      label: 'Nouvelle Formation',
      icon: <Plus className="size-4" />,
      path: routesStatic.formations,
    },
    {
      label: 'Actualiser',
      icon: <RefreshCw className="size-4" />,
      onClick: () => window.location.reload(),
    },
    { label: 'Projets', icon: <Settings className="size-4" />, path: routesStatic.projets },
    { label: 'Actualités', icon: <CircleHelp className="size-4" />, path: routesStatic.actualites },
  ];

  return (
    <div className="rounded-xl border border-ink-100 bg-white p-5 shadow-card">
      <h3 className="mb-4 text-lg font-semibold text-ink-900">Actions Rapides</h3>
      <div className="grid gap-2 sm:grid-cols-2">
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={() => (action.onClick ? action.onClick() : navigate(action.path))}
            className="group flex items-center gap-3 rounded-xl border border-ink-100 px-4 py-3 text-left transition-all duration-200 hover:border-brand-200 hover:bg-brand-50/50 hover:shadow-card"
          >
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${ACTION_STYLES.iconBg}`}
            >
              {action.icon}
            </span>
            <span className="text-sm font-medium text-ink-700 group-hover:text-brand-800">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
