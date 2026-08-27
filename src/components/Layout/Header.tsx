import { Bell, CircleHelp, LogOut, Mail, Menu, Settings, User, X } from 'lucide-react';
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { routesStatic } from '@/routes';
import { useAuth } from '@/contexts';
import { getImageUrl , formatFullName } from '@/utils';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Badge } from '../ui/badge';
import { useRecentAdmissionsQuery, useRecentMessagesQuery } from '@/hooks';

const Header: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user, username, logout } = useAuth();
  const { data: recentAdmissions = [] } = useRecentAdmissionsQuery(4, isAuthenticated);
  const { data: recentMessagesResponse } = useRecentMessagesQuery(4, isAuthenticated);
  const recentMessages = recentMessagesResponse?.data ?? [];

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
  };

  const handleLogoutConfirm = async () => {
    setLogoutDialogOpen(false);
    await logout();
    setOpen(false);
  };

  const handleLogoutCancel = () => {
    setLogoutDialogOpen(false);
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName = formatFullName(user) || username || 'Utilisateur';
  const avatarUrl = user?.avatar ? getImageUrl(user.avatar) : undefined;

  const pendingAdmissionsCount = recentAdmissions.filter((a) => a.statut === 'en_attente').length;

  const unreadMessagesCount = recentMessages.filter((m) => !m.lu).length;

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'en_attente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'en_cours_etude':
        return 'bg-brand-100 text-brand-800 border-brand-300';
      case 'accepte':
        return 'bg-brand-100 text-brand-800 border-brand-300';
      case 'refuse':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-ink-100 text-ink-800 border-ink-300';
    }
  };

  const getStatusLabel = (statut: string) => {
    switch (statut) {
      case 'en_attente':
        return 'En attente';
      case 'en_cours_etude':
        return "En cours d'étude";
      case 'accepte':
        return 'Accepté';
      case 'refuse':
        return 'Refusé';
      default:
        return statut;
    }
  };

  return (
    <header className="bg-white shadow-sm z-20 sticky top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <p className="text-ink-600 text-sm">
              Bienvenue dans l'espace d'administration de l'ESSG
            </p>
          </div>

          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-1 lg:gap-2">
              <DropdownMenu>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-ink-700 hover:text-brand-600 relative"
                          aria-label="messages"
                        >
                          <Badge
                            variant="danger"
                            className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs"
                          >
                            {unreadMessagesCount}
                          </Badge>
                          <Mail className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent>Messages</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <DropdownMenuContent
                  align="end"
                  className="w-80 shadow-none ring-0 bg-white border border-ink-100"
                >
                  <div className="px-3 py-2 border-b border-ink-100">
                    <h3 className="text-sm font-semibold text-ink-900">Messages</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {recentMessages.length === 0 ? (
                      <div className="px-3 py-4 text-sm text-ink-500 text-center">
                        Aucun message
                      </div>
                    ) : (
                      recentMessages.map((message) => (
                        <DropdownMenuItem
                          key={message.id}
                          className="flex flex-col items-start p-3 cursor-pointer"
                          onClick={() => navigate(routesStatic.contacts)}
                        >
                          <div className="flex items-start justify-between w-full">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-ink-900">
                                {formatFullName(message)}
                              </p>
                              <p className="text-xs text-ink-500 mt-1">{message.email}</p>
                              <p className="text-xs text-ink-600 mt-1 line-clamp-2">
                                {message.message}
                              </p>
                              {!message.lu && (
                                <span className="inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full bg-brand-100 text-brand-800 border border-brand-300">
                                  Non lu
                                </span>
                              )}
                            </div>
                          </div>
                        </DropdownMenuItem>
                      ))
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => navigate(routesStatic.contacts)}
                    className="text-center text-sm font-medium text-brand-600 hover:text-brand-700"
                  >
                    Voir plus
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-ink-700 hover:text-brand-600 relative"
                          aria-label="notifications"
                        >
                          <Badge
                            variant="danger"
                            className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs"
                          >
                            {pendingAdmissionsCount}
                          </Badge>
                          <Bell className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent>Notifications</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <DropdownMenuContent
                  align="end"
                  className="w-80 shadow-none ring-0 bg-white border border-ink-100"
                >
                  <div className="px-3 py-2 border-b border-ink-100">
                    <h3 className="text-sm font-semibold text-ink-900">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {recentAdmissions.length === 0 ? (
                      <div className="px-3 py-4 text-sm text-ink-500 text-center">
                        Aucune notification
                      </div>
                    ) : (
                      recentAdmissions.map((admission) => (
                        <DropdownMenuItem
                          key={admission.id}
                          className="flex flex-col items-start p-3 cursor-pointer"
                          onClick={() => navigate(routesStatic.admissions)}
                        >
                          <div className="flex items-start justify-between w-full">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-ink-900">
                                {formatFullName(admission)}
                              </p>
                              <p className="text-xs text-ink-500 mt-1">
                                Formation: {admission.formation}
                              </p>
                              <span
                                className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(admission.statut)}`}
                              >
                                {getStatusLabel(admission.statut)}
                              </span>
                            </div>
                          </div>
                        </DropdownMenuItem>
                      ))
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => navigate(routesStatic.admissions)}
                    className="text-center text-sm font-medium text-brand-600 hover:text-brand-700"
                  >
                    Voir plus
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger>
                        <button
                          type="button"
                          className="flex items-center gap-2 ml-2 pl-2 pr-1 py-1 rounded-full hover:bg-ink-50 transition-colors outline-none"
                          aria-label="profil"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={avatarUrl || undefined}
                              alt={displayName}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                            <AvatarFallback className="bg-brand-600 text-white text-xs">
                              {getInitials(displayName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="hidden lg:flex flex-col items-start mr-1">
                            <p className="text-xs font-medium text-ink-900 leading-tight">
                              {displayName}
                            </p>
                          </div>
                        </button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent>Profil</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <DropdownMenuContent
                  align="end"
                  className="w-48 shadow-none ring-0 bg-white border border-ink-100"
                >
                  <DropdownMenuItem onClick={() => navigate(routesStatic.profil)}>
                    <User className="h-4 w-4 mr-2" />
                    Mon profil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(routesStatic.parametres)}>
                    <Settings className="h-4 w-4 mr-2" />
                    Paramètres
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogoutClick}
                    className="text-red-600 focus:text-red-600"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen((s) => !s)}
              className="text-ink-700"
              aria-label="Toggle menu"
            >
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t shadow-sm">
          <div className="px-4 sm:px-6 py-4 flex flex-col gap-4">
            {isAuthenticated && (
              <div className="flex items-center justify-between pb-4 border-b border-ink-100">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={avatarUrl || undefined}
                      alt={displayName}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <AvatarFallback className="bg-brand-600 text-white text-sm">
                      {getInitials(displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-ink-900">{displayName}</p>
                    <p className="text-xs text-ink-500">Administrateur</p>
                  </div>
                </div>
              </div>
            )}

            <nav className="flex flex-col gap-1">
              <NavLink
                to={routesStatic.dashboard}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `py-2.5 px-3 rounded-md text-sm font-medium ${
                    isActive ? 'bg-brand-50 text-brand-600' : 'text-ink-700 hover:bg-ink-50'
                  }`
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to={routesStatic.admissions}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `py-2.5 px-3 rounded-md text-sm font-medium ${
                    isActive ? 'bg-brand-50 text-brand-600' : 'text-ink-700 hover:bg-ink-50'
                  }`
                }
              >
                Admissions
              </NavLink>
              <NavLink
                to={routesStatic.contacts}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `py-2.5 px-3 rounded-md text-sm font-medium ${
                    isActive ? 'bg-brand-50 text-brand-600' : 'text-ink-700 hover:bg-ink-50'
                  }`
                }
              >
                Contacts
              </NavLink>
              <NavLink
                to={routesStatic.projets}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `py-2.5 px-3 rounded-md text-sm font-medium ${
                    isActive ? 'bg-brand-50 text-brand-600' : 'text-ink-700 hover:bg-ink-50'
                  }`
                }
              >
                Projets
              </NavLink>
              <NavLink
                to={routesStatic.formations}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `py-2.5 px-3 rounded-md text-sm font-medium ${
                    isActive ? 'bg-brand-50 text-brand-600' : 'text-ink-700 hover:bg-ink-50'
                  }`
                }
              >
                Formations
              </NavLink>
              <NavLink
                to={routesStatic.partenaires}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `py-2.5 px-3 rounded-md text-sm font-medium ${
                    isActive ? 'bg-brand-50 text-brand-600' : 'text-ink-700 hover:bg-ink-50'
                  }`
                }
              >
                Partenaires
              </NavLink>
              <NavLink
                to={routesStatic.actualites}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `py-2.5 px-3 rounded-md text-sm font-medium ${
                    isActive ? 'bg-brand-50 text-brand-600' : 'text-ink-700 hover:bg-ink-50'
                  }`
                }
              >
                Actualités
              </NavLink>
              {user?.role === 'admin' && (
                <NavLink
                  to={routesStatic.activityLogs}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `py-2.5 px-3 rounded-md text-sm font-medium ${
                      isActive ? 'bg-brand-50 text-brand-600' : 'text-ink-700 hover:bg-ink-50'
                    }`
                  }
                >
                  Journal des actions
                </NavLink>
              )}
            </nav>

            {isAuthenticated && (
              <>
                <hr className="border-ink-100" />
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 py-2.5 px-3 rounded-md text-sm font-medium text-ink-700 hover:bg-ink-50"
                  >
                    <Bell className="size-4" />
                    <span>Notifications</span>
                    <Badge variant="destructive" className="ml-auto px-1.5 py-0.5 text-xs">
                      {pendingAdmissionsCount}
                    </Badge>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 py-2.5 px-3 rounded-md text-sm font-medium text-ink-700 hover:bg-ink-50"
                  >
                    <Mail className="size-4" />
                    <span>Messages</span>
                    <Badge variant="default" className="ml-auto px-1.5 py-0.5 text-xs">
                      {unreadMessagesCount}
                    </Badge>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 py-2.5 px-3 rounded-md text-sm font-medium text-ink-700 hover:bg-ink-50"
                  >
                    <CircleHelp className="size-4" />
                    <span>Aide</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      navigate(routesStatic.profil);
                      setOpen(false);
                    }}
                    className="flex items-center gap-3 py-2.5 px-3 rounded-md text-sm font-medium text-ink-700 hover:bg-ink-50"
                  >
                    <User className="size-4" />
                    <span>Mon profil</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      navigate(routesStatic.parametres);
                      setOpen(false);
                    }}
                    className="flex items-center gap-3 py-2.5 px-3 rounded-md text-sm font-medium text-ink-700 hover:bg-ink-50"
                  >
                    <Settings className="size-4" />
                    <span>Paramètres</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleLogoutClick}
                    className="flex items-center gap-3 py-2.5 px-3 rounded-md text-sm font-medium text-red-600 hover:bg-ink-50"
                  >
                    <LogOut className="size-4" />
                    <span>Déconnexion</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <DialogContent className="bg-white border-2 border-ink-100 shadow-2xl">
          <DialogHeader className="bg-gradient-to-r from-brand-500 to-purple-600 -mx-4 -mt-4 px-6 py-4 rounded-t-xl">
            <DialogTitle className="text-white text-xl font-bold">
              Confirmer la déconnexion
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-ink-700">
              Êtes-vous sûr de vouloir vous déconnecter ? Vous devrez vous reconnecter pour accéder
              à l'espace d'administration.
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={handleLogoutCancel}
              className="border-2 border-ink-300 hover:bg-ink-50"
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleLogoutConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Se déconnecter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default Header;
