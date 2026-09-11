import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createUser, deleteUser, getAllUsers, updateUser, uploadAvatar } from '@/services';
import type { User } from '@/types';
import { queryKeys } from './keys';

export function useUsersQuery() {
  return useQuery({
    queryKey: queryKeys.users.list(),
    queryFn: getAllUsers,
    select: (response) => response.data,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userData,
      avatarFile,
    }: {
      userData: Parameters<typeof createUser>[0];
      avatarFile?: File;
    }) => {
      const created = await createUser(userData);
      if (avatarFile && created.id) {
        try {
          return await uploadAvatar(created.id, avatarFile);
        } catch (error) {
          console.warn('Échec dans mutationFn — poursuite en mode dégradé', error instanceof Error ? error.message : error);
          return created;
        }
      }
      return created;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<User> & { motDePasse?: string } }) =>
      updateUser(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}
