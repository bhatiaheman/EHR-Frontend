"use client";
import AppointmentTable from '@/components/appointments/AppointmentTable';
import { Button } from '@/components/ui/button'
import { useAddAppointment, useAppointments } from '@/hooks/useAppointments';
import React from 'react'

const Appointmnets = () => {

    const [modalOpen, setModalOpen] = React.useState(false);
    const addAppointmentMutation = useAddAppointment();

    const {data, isLoading, error} = useAppointments();

    if(isLoading) return <div>Loading...</div>
    if(error) return <div>Error loading patients</div>

  return (
    <div className='flex flex-col gap-8 m-6'>
      <div className='flex flex-row justify-between items-center'>
        <div>
          <h1 className='text-4xl font-semibold'>Appointments</h1>
          <p className='text-xl text-muted-foreground'>Manage patient appointments and scheduling</p>
        </div>

        <Button className='bg-blue-600 hover:bg-blue-700 text-white'
        onClick={() => setModalOpen(true)}>
          + Add Patient
        </Button>
      </div>


      {data && <AppointmentTable appointments={data}/>}

 
    </div>
  )
}

export default Appointmnets
