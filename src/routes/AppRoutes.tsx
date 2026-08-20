import { Fingerprint } from 'lucide-react';
import React from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import {
  Login,
  Dashboard,
  Actualites,
  RessourcesHumaines,
  Utilisateurs,
  Formations,
  Projets,
  Partenaires,
  Contacts,
  Admissions,
  Profil,
  ActivityLogs,
  Parametres,
} from '../pages';
import { routesStatic } from '.';
import { Layout } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { isAdminRole } from '../constants/navigation';

// Loading Spinner
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

// Protected Route
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

  // Redirection silencieuse vers le tableau de bord : aucun message d'erreur
  // technique n'est affiché à un utilisateur non-admin.
  if (!isAdminRole(user?.role)) {
    return <Navigate to={routesStatic.dashboard} replace />;
  }

  return children;
};

// Public Route
const PublicRoute = ({ children }: { children: React.JSX.Element }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return isAuthenticated ? <Navigate to={routesStatic.dashboard} replace /> : children;
};

const AppRoutes = () => {
  return (
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

      {/*
        Gestion des utilisateurs : réservée aux administrateurs.
        Le menu est masqué dans le Sidebar (cf. constants/navigation.ts) ET
        la route est protégée ici ; le backend refuse de son côté les appels
        non-admin sur /users (@Roles('admin')).
      */}
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
  );
};

export default AppRoutes;
