export const queryKeys = {
  formations: {
    all: ['formations'] as const,
    list: () => [...queryKeys.formations.all, 'list'] as const,
    detail: (id: number) => [...queryKeys.formations.all, 'detail', id] as const,
  },
  actualites: {
    all: ['actualites'] as const,
    list: () => [...queryKeys.actualites.all, 'list'] as const,
  },
  projets: {
    all: ['projets'] as const,
    list: () => [...queryKeys.projets.all, 'list'] as const,
  },
  partenaires: {
    all: ['partenaires'] as const,
    list: () => [...queryKeys.partenaires.all, 'list'] as const,
  },
  ressourcesHumaines: {
    all: ['ressources-humaines'] as const,
    list: () => [...queryKeys.ressourcesHumaines.all, 'list'] as const,
  },
  users: {
    all: ['users'] as const,
    list: (page?: number, limit?: number) => [...queryKeys.users.all, 'list', page, limit] as const,
  },
  messages: {
    all: ['messages'] as const,
    list: (params: object) => [...queryKeys.messages.all, 'list', params] as const,
  },
  admissions: {
    all: ['admissions'] as const,
    list: (params: object) => [...queryKeys.admissions.all, 'list', params] as const,
    detail: (id: number) => [...queryKeys.admissions.all, 'detail', id] as const,
    files: (id: number) => [...queryKeys.admissions.all, 'files', id] as const,
  },
  settings: {
    all: ['settings'] as const,
    get: () => [...queryKeys.settings.all, 'get'] as const,
  },
  dashboard: {
    all: ['dashboard'] as const,
    stats: () => [...queryKeys.dashboard.all, 'stats'] as const,
    activities: () => [...queryKeys.dashboard.all, 'activities'] as const,
  },
  activityLogs: {
    all: ['activity-logs'] as const,
    list: (params: object) => [...queryKeys.activityLogs.all, 'list', params] as const,
    detail: (id: number) => [...queryKeys.activityLogs.all, 'detail', id] as const,
  },
  sessions: {
    all: ['sessions'] as const,
    current: () => [...queryKeys.sessions.all, 'current'] as const,
    mine: () => [...queryKeys.sessions.all, 'mine'] as const,
    presence: (page?: number, limit?: number) =>
      [...queryKeys.sessions.all, 'presence', page, limit] as const,
    user: (userId: number) => [...queryKeys.sessions.all, 'user', userId] as const,
  },
};
