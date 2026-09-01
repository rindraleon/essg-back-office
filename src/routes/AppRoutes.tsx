import { Fingerprint } from 'lucide-react';
import React, { lazy, Suspense } from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import routesStatic from './routes';
import { Layout } from '@/components';
import { useAuth } from '@/contexts';
import { isAdminRole } from '@/constants';

const Login = lazy(() => import('@/pages/LoginPage/Login'));
const Dashboard = lazy(() => import('@/pages/DashboardPage/Dashboard'));
const Actualites = lazy(() => import('@/pages/ActualitesPage/Actualites'));
const RessourcesHumaines = lazy(() => import('@/pages/RessourcesHumainesPage/RessourcesHumaines'));
const Utilisateurs = lazy(() => import('@/pages/UtilisateursPage/Utilisateurs'));
const Formations = lazy(() => import('@/pages/FormationsPage/Formations'));
const Projets = lazy(() => import('@/pages/ProjetsPage/Projets'));
const Partenaires = lazy(() => import('@/pages/PartenairesPage/Partenaires'));
const Contacts = lazy(() => import('@/pages/ContactsPage/Contacts'));
const Admissions = lazy(() => import('@/pages/AdmissionsPage/Admissions'));
const Profil = lazy(() => import('@/pages/ProfilPage/Profil'));
const ActivityLogs = lazy(() => import('@/pages/ActivityLogsPage/ActivityLogs'));
const Parametres = lazy(() => import('@/pages/ParametresPage/Parametres'));

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-ink-950">
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-16 h-16">
        <div
          className="absolute inset-0 rounded-full border-2 border-transparent"
          style={{
            borderTopColor: 'rgba(132,204,22,0.7)',
            animation: 'spin 1s linear infinite',
          }}
        />
        <Fingerprint />
      </div>
      <p className="text-sage-300/60 text-sm tracking-widest animate-pulse">Vérification...</p>
    </div>
    <style>{`
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

const ProtectedRoute = ({ children }: { children: React.JSX.Element }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return isAuthenticated ? (
    children
  ) : (
    <Navigate to={routesStatic.login} replace state={{ from: location }} />
  );
};

const AdminRoute = ({ children }: { children: React.JSX.Element }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to={routesStatic.login} replace state={{ from: location }} />;
  }

  if (!isAdminRole(user?.role)) {
    return <Navigate to={routesStatic.dashboard} replace />;
  }

  return children;
};

const PublicRoute = ({ children }: { children: React.JSX.Element }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return isAuthenticated ? <Navigate to={routesStatic.dashboard} replace /> : children;
};

const AppRoutes = () => {
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

        <Route path="/" element={<Navigate to={routesStatic.login} replace />} />

        <Route
          path={routesStatic.dashboard}
          element={
            <Layout showSidebar>
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            </Layout>
          }
        />

        <Route
          path={routesStatic.actualites}
          element={
            <Layout showSidebar>
              <ProtectedRoute>
                <Actualites />
              </ProtectedRoute>
            </Layout>
          }
        />

        <Route
          path={routesStatic.ressourcesHumaines}
          element={
            <Layout showSidebar>
              <ProtectedRoute>
                <RessourcesHumaines />
              </ProtectedRoute>
            </Layout>
          }
        />

        <Route
          path={routesStatic.utilisateurs}
          element={
            <Layout showSidebar>
              <AdminRoute>
                <Utilisateurs />
              </AdminRoute>
            </Layout>
          }
        />

        <Route
          path={routesStatic.formations}
          element={
            <Layout showSidebar>
              <ProtectedRoute>
                <Formations />
              </ProtectedRoute>
            </Layout>
          }
        />

        <Route
          path={routesStatic.projets}
          element={
            <Layout showSidebar>
              <ProtectedRoute>
                <Projets />
              </ProtectedRoute>
            </Layout>
          }
        />

        <Route
          path={routesStatic.partenaires}
          element={
            <Layout showSidebar>
              <ProtectedRoute>
                <Partenaires />
              </ProtectedRoute>
            </Layout>
          }
        />

        <Route
          path={routesStatic.contacts}
          element={
            <Layout showSidebar>
              <ProtectedRoute>
                <Contacts />
              </ProtectedRoute>
            </Layout>
          }
        />

        <Route
          path={routesStatic.admissions}
          element={
            <Layout showSidebar>
              <ProtectedRoute>
                <Admissions />
              </ProtectedRoute>
            </Layout>
          }
        />

        <Route
          path={routesStatic.activityLogs}
          element={
            <Layout showSidebar>
              <AdminRoute>
                <ActivityLogs />
              </AdminRoute>
            </Layout>
          }
        />

        <Route
          path={routesStatic.profil}
          element={
            <Layout showSidebar>
              <ProtectedRoute>
                <Profil />
              </ProtectedRoute>
            </Layout>
          }
        />

        <Route
          path={routesStatic.parametres}
          element={
            <Layout showSidebar>
              <AdminRoute>
                <Parametres />
              </AdminRoute>
            </Layout>
          }
        />

        <Route path="*" element={<Navigate to={routesStatic.login} replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
