"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Patient } from "../../../types/patient.types";

let patients: Patient[] = [
  {
    id: 1,
    name: "John Doe",
    age: 25,
    gender: "Male",
    contact: "123-456-7890",
    conditions: ["Diabetes"],
    allergies: ["Peanuts"],
    medications: ["Metformin"],
    immunizations: ["COVID-19"],
    lastVisit: "2024-01-15",
    status: "Active",
  },
  {
    id: 2,
    name: "Jane Smith",
    age: 32,
    gender: "Female",
    contact: "987-654-3210",
    conditions: ["Asthma"],
    allergies: [],
    medications: ["Inhaler"],
    immunizations: ["Flu"],
    lastVisit: "2024-02-10",
    status: "Pending",
  },
];

export function usePatients() {
  return useQuery<Patient[]>({
    queryKey: ["patients"],
    queryFn: async () => {
      await new Promise((res) => setTimeout(res, 500));
      return patients;
    },
  });
}

export function useUpdatePatient() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (updated: Patient) => {
      patients = patients.map((p) =>
        p.id === updated.id ? { ...p, ...updated } : p
      );
      return updated;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["patients"] });
    },
  });
}
