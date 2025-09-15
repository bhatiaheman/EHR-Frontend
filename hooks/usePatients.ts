import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Patient } from "../types/patient.types";
import toast from "react-hot-toast";
import axios from "axios";


export const useAddPatient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (patient: Patient) => {
      const response = await fetch('/api/patient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patient),
      });
      if (response.status === 401) {
        throw new Error('Authentication required. Please log in again.');
      }
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create patient');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast.success('Patient added successfully');
    },

    onError: (error: any) => {
      toast.error(error.message || 'Failed to add patient');
    }
  });
};

export function usePatient(id: string) {
  return useQuery<Patient>({
    queryKey: ['patient', id],
    queryFn: async () => {
      const res = await axios.get(`/api/patient?id=${id}`);
      return res.data;
    }
  });
}

export function usePatients() {
  return useQuery<Patient[]>({
    queryKey: ["patients"],
    queryFn: async () => {
      const res = await axios.get('/api/patient'); 
      return res.data;
    },
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (patient: Partial<Patient> & { id: string }) => {
      const res = await axios.put(`/api/patient?id=${patient.id}`, {
        name: patient.name,
        contact: patient.contact,
        gender: patient.gender,
        birthDate: patient.age
          ? new Date(new Date().setFullYear(new Date().getFullYear() - patient.age)).toISOString().split('T')[0]
          : undefined,
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Patient updated successfully');
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
    onError: (err: any) => {
      toast.error('Failed to update patient');
    },
  });
}
