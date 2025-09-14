import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Patient } from "../types/patient.types";
import toast from "react-hot-toast";

export let patients: Patient[] = [
  {
    id: 1,
    name: "John Doe",
    age: 25,
    gender: "Male",
    contact: "123-456-7890",
    conditions: ["Diabetes", "Hypertension"],
    allergies: ["Peanuts", "Dust"],
    medications: [
      { name: "Metformin", dose: "500mg" },
      { name: "Lisinopril", dose: "10mg" },
    ],
    immunizations: [
      { vaccine: "COVID-19", status: "Completed" },
      { vaccine: "Hepatitis B", status: "Pending" },
    ],
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
    allergies: ["Pollen"],
    medications: [
      { name: "Inhaler", dose: "2 puffs" },
      { name: "Albuterol", dose: "90mcg" },
    ],
    immunizations: [
      { vaccine: "Flu", status: "Completed" },
      { vaccine: "Tetanus", status: "Completed" },
    ],
    lastVisit: "2024-02-10",
    status: "Pending",
  },
  {
    id: 3,
    name: "Alice Johnson",
    age: 40,
    gender: "Female",
    contact: "555-123-9876",
    conditions: ["Arthritis"],
    allergies: [],
    medications: [
      { name: "Ibuprofen", dose: "400mg" },
      { name: "Glucosamine", dose: "500mg" },
    ],
    immunizations: [
      { vaccine: "Flu", status: "Completed" },
      { vaccine: "COVID-19", status: "Completed" },
    ],
    lastVisit: "2024-03-20",
    status: "Recovered",
  },
  {
    id: 4,
    name: "Bob Brown",
    age: 50,
    gender: "Male",
    contact: "222-456-7890",
    conditions: ["High Cholesterol"],
    allergies: ["Shellfish"],
    medications: [
      { name: "Atorvastatin", dose: "20mg" },
    ],
    immunizations: [
      { vaccine: "Hepatitis A", status: "Completed" },
      { vaccine: "Flu", status: "Pending" },
    ],
    lastVisit: "2024-04-12",
    status: "Critical",
  },
];

export function useAddPatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (newPatient: Patient) => {

      patients.push(newPatient);
      return newPatient;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["patients"] });
      toast.success("Patient added successfully");
    },

    onError: () => {
      toast.error("Error adding patient");
    }
  });
}

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
      toast.success("Patient updated successfully");
    },

    onError: () => {
      toast.error("Error updating patient");
    }
  });
}
