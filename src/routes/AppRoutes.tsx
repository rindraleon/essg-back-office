import React, { lazy, Suspense } from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import routesStatic from './routes';
import { useAuth } from '@/contexts';
import { PERMISSIONS, isAdminRole, type Permission } from '@/constants';
import { CoreSpinLoader } from '@/components/ui/core-spin-loader';
import EssG from '@/assets/files/images/logo/EssG.png';

const Login = lazy(() => import('@/pages/LoginPage/Login'));
const ForgotPassword = lazy(() => import('@/pages/LoginPage/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/LoginPage/ResetPassword'));
// ESSG-PERF-02 : le Layout (et le baril de composants qu'il entraîne :
// cartographie, galeries, etc.) n'est chargé qu'après authentification.
const Layout = lazy(() => import('@/components/Layout/Layout'));
const Dashboard = lazy(() => import('@/pages/DashboardPage/Dashboard'));
const Actualites = lazy(() => import('@/pages/ActualitesPage/Actualites'));
const RessourcesHumaines = lazy(() => import('@/pages/RessourcesHumainesPage/RessourcesHumaines'));
const Utilisateurs = lazy(() => import('@/pages/UtilisateursPage/Utilisateurs'));
const Formations = lazy(() => import('@/pages/FormationsPage/Formations'));
const MentionsParcours = lazy(() => import('@/pages/MentionsParcoursPage/MentionsParcours'));
const Aide = lazy(() => import('@/pages/AidePage/Aide'));
const Projets = lazy(() => import('@/pages/ProjetsPage/Projets'));
const Partenaires = lazy(() => import('@/pages/PartenairesPage/Partenaires'));
const Contacts = lazy(() => import('@/pages/ContactsPage/Contacts'));
const Admissions = lazy(() => import('@/pages/AdmissionsPage/Admissions'));
const Profil = lazy(() => import('@/pages/ProfilPage/Profil'));
const ActivityLogs = lazy(() => import('@/pages/ActivityLogsPage/ActivityLogs'));
const Parametres = lazy(() => import('@/pages/ParametresPage/Parametres'));

const LoadingScreen = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-ink-50 animate-fade-in">
    <img
      src={EssG}
      alt="Logo ESSG"
      className="h-16 w-auto object-contain animate-fade-in-up motion-reduce:animate-none"
    />
    <CoreSpinLoader />
  </div>
);

const ProtectedRoute = ({
  children,
  permission,
}: {
  children: React.JSX.Element;
  permission?: Permission;
}) => {
  const { isAuthenticated, hasPermission } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={routesStatic.login} replace state={{ from: location }} />;
  }

  if (permission && !hasPermission(permission)) {
    const fallback = hasPermission(PERMISSIONS.DASHBOARD_VIEW)
      ? routesStatic.dashboard
      : routesStatic.profil;
    return <Navigate to={fallback} replace />;
  }

  return children;
};

const AdminRoute = ({ children }: { children: React.JSX.Element }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={routesStatic.login} replace state={{ from: location }} />;
  }

  if (!isAdminRole(user?.role)) {
    return <Navigate to={routesStatic.dashboard} replace />;
  }

  return children;
};

const PublicRoute = ({ children }: { children: React.JSX.Element }) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return (
      <>
        <Navigate to={routesStatic.dashboard} replace />
        <LoadingScreen />
      </>
    );
  }

  return children;
};

const AppRoutes = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route
          path={routesStatic.login}
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path={routesStatic.forgotPassword}
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />

        <Route path={routesStatic.resetPassword} element={<ResetPassword />} />

        <Route path="/" element={<Navigate to={routesStatic.login} replace />} />

        <Route
          path={routesStatic.dashboard}
          element={
            <ProtectedRoute permission={PERMISSIONS.DASHBOARD_VIEW}>
              <Layout showSidebar>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path={routesStatic.actualites}
          element={
            <ProtectedRoute permission={PERMISSIONS.CONTENT_VIEW}>
              <Layout showSidebar>
                <Actualites />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path={routesStatic.ressourcesHumaines}
          element={
            <ProtectedRoute permission={PERMISSIONS.CONTENT_VIEW}>
              <Layout showSidebar>
                <RessourcesHumaines />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path={routesStatic.utilisateurs}
          element={
            <AdminRoute>
              <Layout showSidebar>
                <Utilisateurs />
              </Layout>
            </AdminRoute>
          }
        />

        <Route
          path={routesStatic.formations}
          element={
            <ProtectedRoute permission={PERMISSIONS.CONTENT_VIEW}>
              <Layout showSidebar>
                <Formations />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path={routesStatic.mentionsParcours}
          element={
            <ProtectedRoute permission={PERMISSIONS.CONTENT_VIEW}>
              <Layout showSidebar>
                <MentionsParcours />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path={routesStatic.aide}
          element={
            <ProtectedRoute>
              <Layout showSidebar>
                <Aide />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path={routesStatic.projets}
          element={
            <ProtectedRoute permission={PERMISSIONS.CONTENT_VIEW}>
              <Layout showSidebar>
                <Projets />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path={routesStatic.partenaires}
          element={
            <ProtectedRoute permission={PERMISSIONS.CONTENT_VIEW}>
              <Layout showSidebar>
                <Partenaires />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path={routesStatic.contacts}
          element={
            <ProtectedRoute permission={PERMISSIONS.CONTACT_VIEW}>
              <Layout showSidebar>
                <Contacts />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path={routesStatic.admissions}
          element={
            <ProtectedRoute permission={PERMISSIONS.ADMISSION_VIEW}>
              <Layout showSidebar>
                <Admissions />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path={routesStatic.activityLogs}
          element={
            <AdminRoute>
              <Layout showSidebar>
                <ActivityLogs />
              </Layout>
            </AdminRoute>
          }
        />

        <Route
          path={routesStatic.profil}
          element={
            <ProtectedRoute>
              <Layout showSidebar>
                <Profil />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path={routesStatic.parametres}
          element={
            <ProtectedRoute permission={PERMISSIONS.SETTINGS_ADMISSION}>
              <Layout showSidebar>
                <Parametres />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to={routesStatic.login} replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
