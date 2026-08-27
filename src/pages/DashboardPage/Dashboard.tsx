import { Folder, GraduationCap, Handshake, Mail, Newspaper, UserCheck, Users } from 'lucide-react';
import {
  useScrollToTop,
  useTitle,
  useDashboardStatsQuery,
  useRecentActivitiesQuery,
} from '@/hooks';
import { StatCard, RecentActivity } from '@/components';
import { routesStatic } from '@/routes';

const Dashboard = () => {
  useScrollToTop();
  useTitle('Tableau de bord');

  const { data: stats, isLoading: statsLoading } = useDashboardStatsQuery();
  const { data: activities = [], isLoading: activitiesLoading } = useRecentActivitiesQuery();
  const loading = statsLoading || activitiesLoading;

  const formatCount = (value: number | string | undefined) => {
    const numericValue = Number(value ?? 0);
    return Number.isFinite(numericValue) ? numericValue.toLocaleString() : '0';
  };

  const statCards = stats
    ? [
        {
          title: 'Utilisateurs',
          value: formatCount(stats.totalUsers),
          change: stats.usersChange,
          icon: <Users className="size-5" />,
          to: routesStatic.utilisateurs,
        },
        {
          title: 'Formations',
          value: formatCount(stats.totalFormations),
          change: stats.formationsChange,
          icon: <GraduationCap className="size-5" />,
          to: routesStatic.formations,
        },
        {
          title: 'Actualités',
          value: formatCount(stats.totalNews),
          change: stats.newsChange,
          icon: <Newspaper className="size-5" />,
          to: routesStatic.actualites,
        },
        {
          title: 'Projets',
          value: formatCount(stats.totalProjects),
          change: stats.projectsChange,
          icon: <Folder className="size-5" />,
          to: routesStatic.projets,
        },
        {
          title: 'Partenariats',
          value: formatCount(stats.totalPartnerships ?? stats.totalPartners),
          change: stats.partnershipsChange,
          icon: <Handshake className="size-5" />,
          to: routesStatic.partenaires,
        },
        {
          title: 'Ressources',
          value: formatCount(stats.totalResources),
          change: stats.resourcesChange,
          icon: <Users className="size-5" />,
          to: routesStatic.ressourcesHumaines,
        },
        {
          title: 'Admissions',
          value: formatCount(stats.totalAdmissions),
          change: stats.admissionsChange,
          icon: <UserCheck className="size-5" />,
          to: routesStatic.admissions,
        },
        {
          title: 'Contacts',
          value: formatCount(stats.totalContacts),
          change: stats.contactsChange,
          icon: <Mail className="size-5" />,
          to: routesStatic.contacts,
        },
      ]
    : [];

  return (
    <div className="mx-auto max-w-7xl py-6">
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading && !stats
          ? [
              'users',
              'formations',
              'news',
              'projects',
              'partnerships',
              'resources',
              'admissions',
              'contacts',
            ].map((id) => <StatCard key={`skeleton-${id}`} title="" value="" loading />)
          : statCards.map((stat) => <StatCard key={stat.title} {...stat} />)}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6">
        <RecentActivity activities={activities} loading={loading} />
      </div>
    </div>
  );
};

export default Dashboard;
