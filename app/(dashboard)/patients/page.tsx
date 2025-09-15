'use client';
import { useState } from 'react';
import { usePatients, useAddPatient, useUpdatePatient } from '@/hooks/usePatients';
import PatientModal from '@/components/patients/PatientModal';
import PatientTable from '@/components/patients/PatientTable';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { Patient } from '@/types/patient.types';

const Patients = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const { data, isLoading, error } = usePatients();
  const addPatient = useAddPatient();
  const updatePatient = useUpdatePatient();

  const onAdd = (data: Patient) => {
    addPatient.mutate(data, {
      onSuccess: () => {
        setModalOpen(false);
        toast.success('Patient added successfully');
      },
      onError: (err: any) => {
        toast.error(err.message || 'Error adding patient');
      },
    });
  };

  const onUpdate = (data: Patient) => {
    if (!selectedPatient) return;
    updatePatient.mutate(
      { ...data, id: selectedPatient.id },
      {
        onSuccess: () => {
          setSelectedPatient(null);
          setModalOpen(false);
          toast.success('Patient updated successfully');
        },
        onError: (err: any) => {
          toast.error(err.message || 'Error updating patient');
        },
      }
    );
  };

  return (
    <div className="flex flex-col gap-8 m-6">
      <div className="flex flex-row justify-between items-center">
        <div>
          <h1 className="text-4xl font-semibold text-gray-700">Patients</h1>
          <p className="text-xl text-muted-foreground">Manage patient records and information</p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => {
            setSelectedPatient(null);
            setModalOpen(true);
          }}
        >
          + Add Patient
        </Button>
      </div>

      {isLoading && <div className="text-gray-600">Loading...</div>}
      {error && <div className="text-red-500">Error loading patients: {error.message}</div>}
      {data && (
        <PatientTable
          patients={data}
          onEdit={(patient) => {
            setSelectedPatient(patient);
            setModalOpen(true);
          }}
        />
      )}

      {modalOpen && (
        <PatientModal
          patient={selectedPatient || {
            id: '',
            name: '',
            firstName: '',
            lastName: '',
            age: 0,
            gender: '',
            contact: '',
            phone: '',
            email: '',
            birthDate: '',
            conditions: [],
            allergies: [],
            medications: [],
            immunizations: [],
            lastVisit: '',
            status: 'Active',
          }}
          onClose={() => {
            setModalOpen(false);
            setSelectedPatient(null);
          }}
          onSubmit={selectedPatient ? onUpdate : onAdd}
        />
      )}
    </div>
  );
};

export default Patients;