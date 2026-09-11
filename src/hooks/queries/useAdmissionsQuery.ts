import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteAdmission,
  deleteAdmissionFile,
  getAdmissionById,
  getAdmissionVerifications,
  getAllAdmissions,
  getLatestAdmissionVerification,
  updateAdmissionStatus,
  verifyAdmissionDocuments,
  type AdmissionQuery,
} from '@/services';
import type { AdmissionStatus } from '@/types';
import { queryKeys } from './keys';

export function useRecentAdmissionsQuery(limit = 4, enabled = true) {
  return useQuery({
    queryKey: [...queryKeys.admissions.all, 'recent', limit],
    queryFn: () => getAllAdmissions({ page: 1, limit, sortBy: 'creeLe', sortOrder: 'DESC' }),
    select: (response) => response.data,
    enabled,
  });
}

export function useAdmissionsQuery(query: AdmissionQuery = {}) {
  return useQuery({
    queryKey: queryKeys.admissions.list(query),
    queryFn: () => getAllAdmissions(query),
  });
}

export function useAdmissionDetailQuery(id: number | null) {
  return useQuery({
    queryKey: queryKeys.admissions.detail(id ?? 0),
    queryFn: () => getAdmissionById(id as number),
    enabled: id !== null,
  });
}

export function useUpdateAdmissionStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      statut,
      commentaire,
      reponseDate,
      reponseHeure,
      reponseLieu,
      reponseInstructions,
      reponseMessage,
    }: {
      id: number;
      statut: AdmissionStatus;
      commentaire?: string;
      reponseDate?: string;
      reponseHeure?: string;
      reponseLieu?: string;
      reponseInstructions?: string;
      reponseMessage?: string;
    }) =>
      updateAdmissionStatus(id, {
        statut,
        commentaire,
        reponseDate,
        reponseHeure,
        reponseLieu,
        reponseInstructions,
        reponseMessage,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admissions.all });
    },
  });
}

export function useDeleteAdmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteAdmission(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admissions.all });
    },
  });
}

export function useDeleteAdmissionFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, fileId }: { id: number; fileId: number }) => deleteAdmissionFile(id, fileId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admissions.all });
    },
  });
}

// --- Vérification documentaire ---

export function useVerifyAdmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (admissionId: number) => verifyAdmissionDocuments(admissionId),
    onSuccess: (_data, admissionId) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admissions.detail(admissionId) });
      void queryClient.invalidateQueries({
        queryKey: [...queryKeys.admissions.all, 'verification', admissionId],
      });
    },
  });
}

export function useAdmissionVerifications(admissionId: number | null) {
  return useQuery({
    queryKey: [...queryKeys.admissions.all, 'verification', admissionId ?? 0, 'history'] as const,
    queryFn: () => getAdmissionVerifications(admissionId as number),
    enabled: admissionId !== null,
  });
}

export function useLatestAdmissionVerification(admissionId: number | null) {
  return useQuery({
    queryKey: [...queryKeys.admissions.all, 'verification', admissionId ?? 0, 'latest'] as const,
    queryFn: () => getLatestAdmissionVerification(admissionId as number),
    enabled: admissionId !== null,
  });
}
