"use client";
import PatientModal from '@/components/patients/PatientModal';
import PatientTable from '@/components/patients/PatientTable';
import { Button } from '@/components/ui/button'
import { useAddPatient, usePatients } from '@/hooks/usePatients'
import React from 'react'

const defaultPatient = {
  id: Date.now(), 
  name: "",
  age: 0,
  gender: "",
  contact: "",
  conditions: [],
  allergies: [],
  medications: [],
  immunizations: [],
  lastVisit: "",
  status: "Active",
};

const Patients = () => {
  const [modalOpen, setModalOpen] = React.useState(false);
  const addPatientMutation = useAddPatient();

  const {data, isLoading, error} = usePatients();

  if(isLoading) return <div>Loading...</div>
  if(error) return <div>Error loading patients</div>
  

  return (
    <div className='flex flex-col gap-8 m-6'>
      <div className='flex flex-row justify-between items-center'>
        <div>
          <h1 className='text-4xl font-semibold'>Patients</h1>
          <p className='text-xl text-muted-foreground'>Manage patient records and information</p>
        </div>

        <Button className='bg-blue-600 hover:bg-blue-700 text-white'
        onClick={() => setModalOpen(true)}>
          + Add Patient
        </Button>
      </div>


      {data && <PatientTable patients={data}/>}

      {modalOpen && (
        <PatientModal
          patient={{
            id: 0,
            name: "",
            age: 0,
            gender: "",
            contact: "",
            conditions: [],
            allergies: [],
            medications: [],
            immunizations: [],
            lastVisit: "",
            status: "Active",
          }}
          onClose={() => setModalOpen(false)}
          onSubmit={(newPatient) => addPatientMutation.mutate({...newPatient, id: Date.now()})}
        />
      )}
    </div>
  )
}

export default Patients
