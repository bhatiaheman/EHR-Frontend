'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import { MedicationStatement, Condition } from '../types/patient.types';

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  count: number;
}

export function useMedicationStatements(patientId: string, count?: number, page?: number) {
  return useQuery<PaginatedResponse<MedicationStatement>>({
    queryKey: ['medicationStatements', patientId, count, page],
    queryFn: async () => {
      const params = new URLSearchParams({ patient: patientId });
      if (count) params.append('_count', count.toString());
      if (page) params.append('page', page.toString());
      const res = await axios.get(`/api/medicationstatement?${params.toString()}`);
      return res.data;
    },
    enabled: !!patientId,
  });
}

export function useMedicationStatementById(id: string) {
  return useQuery<MedicationStatement>({
    queryKey: ['medicationStatement', id],
    queryFn: async () => {
      const res = await axios.get(`/api/medicationstatement?id=${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useAddMedicationStatement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      patientId,
      medication,
      medicationCode,
      status,
    }: {
      patientId: string;
      medication: string;
      medicationCode: string;
      status: string;
    }) => {
      const res = await axios.post(`/api/medicationstatement?patient=${patientId}`, {
        medication,
        medicationCode,
        status,
      });
      return res.data;
    },
    onSuccess: (data, variables) => {
      toast.success('Medication added');
      queryClient.invalidateQueries({ queryKey: ['medicationStatements', variables.patientId] });
    },
    onError: (err: any) => toast.error(err.message || 'Failed to add medication'),
  });
}

export function useUpdateMedicationStatement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await axios.put(`/api/medicationstatement?id=${id}`, data);
      return res.data;
    },
    onSuccess: (data, variables) => {
      toast.success('Medication updated');
      queryClient.invalidateQueries({ queryKey: ['medicationStatements'] });
      queryClient.invalidateQueries({ queryKey: ['medicationStatement', variables.id] });
    },
    onError: (err: any) => toast.error(err.message || 'Failed to update medication'),
  });
}


export function useConditions(patientId: string) {
  return useQuery<Condition[]>({
    queryKey: ['conditions', patientId],
    queryFn: async () => {
      const res = await axios.get(`/api/condition?patient=${patientId}`);
      return res.data.items;
    },
    enabled: !!patientId
  });
}

export function useConditionById(id: string) {
  return useQuery<Condition>({
    queryKey: ['condition', id],
    queryFn: async () => {
      const res = await axios.get(`/api/condition?id=${id}`);
      return res.data;
    },
    enabled: !!id
  });
}

export function useAddCondition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      patientId,
      condition,
      conditionCode,
      codeSystem,
      clinicalStatus,
    }: {
      patientId: string;
      condition: string;
      conditionCode: string;
      codeSystem?: string;
      clinicalStatus?: string;
    }) => {
      const res = await axios.post(`/api/condition?patient=${patientId}`, {
        condition,
        conditionCode,
        codeSystem,
        clinicalStatus,
      });
      return res.data;
    },
    onSuccess: (data, variables) => {
      toast.success('Condition added (reconciliation required)');
      queryClient.invalidateQueries({ queryKey: ['conditions', variables.patientId] });
    },
    onError: (err: any) => toast.error(err.message || 'Failed to add condition'),
  });
}

export function useUpdateCondition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await axios.put(`/api/condition?id=${id}`, data);
      return res.data;
    },
    onSuccess: (data, variables) => {
      toast.success('Condition updated (reconciliation required)');
      queryClient.invalidateQueries({ queryKey: ['conditions'] });
      queryClient.invalidateQueries({ queryKey: ['condition', variables.id] });
    },
    onError: (err: any) => toast.error(err.message || 'Failed to update condition'),
  });
}