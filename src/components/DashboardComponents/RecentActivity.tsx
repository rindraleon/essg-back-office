import React from 'react';
import { Avatar, AvatarImage } from '../ui/avatar';

interface Activity {
  id: number;
  user: string;
  action: string;
  time: string;
  type?: 'user' | 'formation' | 'news' | 'project';
  /** Photo de profil de l'utilisateur (facultative — sinon emplacement vide). */
  avatar?: string | null;
}

interface RecentActivityProps {
  activities?: Activity[];
  loading?: boolean;
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities = [], loading = false }) => {
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
      {activities.length === 0 ? (
        <p className="py-6 text-center text-sm text-ink-400">Aucune activité récente.</p>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-4 pb-4 border-b border-ink-100 last:border-0 last:pb-0"
            >
              {/* Photo de profil de l'utilisateur si disponible, sinon emplacement vide. */}
              <Avatar size="sm" className="border border-ink-100">
                <AvatarImage src={activity.avatar ?? undefined} alt={activity.user} />
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-ink-900">
                  <span className="font-medium">{activity.user}</span> {activity.action}
                </p>
                <p className="text-xs text-ink-500 mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
