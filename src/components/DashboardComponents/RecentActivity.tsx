import React from 'react';

interface Activity {
  id: number;
  user: string;
  action: string;
  time: string;
  avatar?: string;
}

interface RecentActivityProps {
  activities?: Activity[];
  loading?: boolean;
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities = [], loading = false }) => {
  const defaultActivities: Activity[] = [
    {
      id: 1,
      user: 'Jean Dupont',
      action: 'a créé une nouvelle commande',
      time: 'Il y a 2 min',
      avatar: '👤',
    },
    {
      id: 2,
      user: 'Marie Martin',
      action: 'a mis à jour son profil',
      time: 'Il y a 15 min',
      avatar: '👤',
    },
    {
      id: 3,
      user: 'Pierre Durand',
      action: 'a téléchargé un rapport',
      time: 'Il y a 1 heure',
      avatar: '👤',
    },
    {
      id: 4,
      user: 'Sophie Bernard',
      action: 'a commenté un article',
      time: 'Il y a 3 heures',
      avatar: '👤',
    },
  ];

  const displayActivities = activities.length > 0 ? activities : defaultActivities;

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-ink-100 p-6">
        <h3 className="text-lg font-semibold text-ink-900 mb-4">Activité Récente</h3>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="flex items-start gap-4 pb-4 border-b border-ink-100 last:border-0 last:pb-0"
            >
              <div className="animate-pulse">
                <div className="h-8 w-8 bg-ink-100 rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="animate-pulse">
                  <div className="h-4 bg-ink-100 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-ink-100 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-ink-100 p-6">
      <h3 className="text-lg font-semibold text-ink-900 mb-4">Activité Récente</h3>
      <div className="space-y-4">
        {displayActivities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-4 pb-4 border-b border-ink-100 last:border-0 last:pb-0"
          >
            <div className="text-2xl">{activity.avatar || '👤'}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-ink-900">
                <span className="font-medium">{activity.user}</span> {activity.action}
              </p>
              <p className="text-xs text-ink-500 mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
