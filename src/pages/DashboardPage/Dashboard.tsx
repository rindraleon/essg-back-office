import { Folder, GraduationCap, Handshake, Mail, Newspaper, UserCheck, Users } from 'lucide-react';
import {
  useScrollToTop,
  useTitle,
  useDashboardStatsQuery,
  useRecentActivitiesQuery,
} from '@/hooks';
import { Button, StatCard, RecentActivity } from '@/components';
import { useAuth } from '@/contexts';
import { PERMISSIONS } from '@/constants';
import { routesStatic } from '@/routes';

const Dashboard = () => {
  useScrollToTop();
  useTitle('Tableau de bord');

  const { isAdmin, hasPermission } = useAuth();
  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
    refetch: refetchStats,
  } = useDashboardStatsQuery();
  const { data: activities = [], isLoading: activitiesLoading } = useRecentActivitiesQuery();
  const loading = statsLoading || activitiesLoading;

  const canViewContent = hasPermission(PERMISSIONS.CONTENT_VIEW);
  const canSee = {
    users: isAdmin,
    formations: canViewContent,
    news: canViewContent,
    projects: canViewContent,
    partnerships: canViewContent,
    resources: canViewContent,
    admissions: hasPermission(PERMISSIONS.ADMISSION_VIEW),
    contacts: hasPermission(PERMISSIONS.CONTACT_VIEW),
  };
  const visibleIds = (Object.keys(canSee) as (keyof typeof canSee)[]).filter((id) => canSee[id]);

  const formatCount = (value: number | string | undefined) => {
    const numericValue = Number(value ?? 0);
    return Number.isFinite(numericValue) ? numericValue.toLocaleString() : '0';
  };

  const statCards = stats
    ? [
        {
          id: 'users' as const,
          title: 'Utilisateurs',
          value: formatCount(stats.totalUsers),
          change: stats.usersChange,
          icon: <Users className="size-5" />,
          to: routesStatic.utilisateurs,
        },
        {
          id: 'formations' as const,
          title: 'Formations',
          value: formatCount(stats.totalFormations),
          change: stats.formationsChange,
          icon: <GraduationCap className="size-5" />,
          to: routesStatic.formations,
        },
        {
          id: 'news' as const,
          title: 'Actualités',
          value: formatCount(stats.totalNews),
          change: stats.newsChange,
          icon: <Newspaper className="size-5" />,
          to: routesStatic.actualites,
        },
        {
          id: 'projects' as const,
          title: 'Projets',
          value: formatCount(stats.totalProjects),
          change: stats.projectsChange,
          icon: <Folder className="size-5" />,
          to: routesStatic.projets,
        },
        {
          id: 'partnerships' as const,
          title: 'Partenariats',
          value: formatCount(stats.totalPartnerships ?? stats.totalPartners),
          change: stats.partnershipsChange,
          icon: <Handshake className="size-5" />,
          to: routesStatic.partenaires,
        },
        {
          id: 'resources' as const,
          title: 'Ressources',
          value: formatCount(stats.totalResources),
          change: stats.resourcesChange,
          icon: <Users className="size-5" />,
          to: routesStatic.ressourcesHumaines,
        },
        {
          id: 'admissions' as const,
          title: 'Admissions',
          value: formatCount(stats.totalAdmissions),
          change: stats.admissionsChange,
          icon: <UserCheck className="size-5" />,
          to: routesStatic.admissions,
        },
        {
          id: 'contacts' as const,
          title: 'Contacts',
          value: formatCount(stats.totalContacts),
          change: stats.contactsChange,
          icon: <Mail className="size-5" />,
          to: routesStatic.contacts,
        },
      ].filter((card) => canSee[card.id])
    : [];

  return (
    <div className="mx-auto max-w-7xl py-6">
      {statsError && !stats && (
        <div
          role="alert"
          className="mb-6 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between"
        >
          <span>Impossible de charger les statistiques.</span>
          <Button variant="outline" size="sm" onClick={() => void refetchStats()}>
            Réessayer
          </Button>
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading && !stats
          ? visibleIds.map((id) => <StatCard key={`skeleton-${id}`} title="" value="" loading />)
          : statCards.map(({ id, ...stat }) => <StatCard key={id} {...stat} />)}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6">
        <RecentActivity activities={activities} loading={loading} />
      </div>
    </div>
  );
};

export default Dashboard;
