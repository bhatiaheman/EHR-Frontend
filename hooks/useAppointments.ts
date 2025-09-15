// hooks/useAppointments.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Appointment } from "../types/appointment.types";
import toast from "react-hot-toast";

let appointments: Appointment[] = [
  {
      id: 1,
      patientId: 1,
      patientName: "John Doe",
      providerId: 1,
      providerName: "Dr. Smith",
      date: "2025-09-20",
      time: "10:00",
      status: "Scheduled",
      type: "Consultation"
  },
  {
      id: 2,
      patientId: 2,
      patientName: "Jane Smith",
      providerId: 2,
      providerName: "Dr. Adams",
      date: "2025-09-21",
      time: "11:30",
      status: "Scheduled",
      type: "Consultation"
  },
];

export function useAppointments() {
  return useQuery<Appointment[]>({
    queryKey: ["appointments"],
    queryFn: async () => {
      await new Promise((res) => setTimeout(res, 300));
      return appointments;
    },
  });
}

export function useAddAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (newAppointment: Appointment) => {
      appointments.push(newAppointment);
      return newAppointment;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Appointment added successfully");
    },

    onError: () => {
        toast.error("Error adding appointment");
    }
  });
}

export function useUpdateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (updated: Appointment) => {
      appointments = appointments.map((a) =>
        a.id === updated.id ? { ...a, ...updated } : a
      );
      return updated;
    },
    onSuccess: () => {
       qc.invalidateQueries({ queryKey: ["appointments"] });
       toast.success("Appointment updated successfully");
    },

    onError: () => {
        toast.error("Error updating appointment");
    }
  });
}
