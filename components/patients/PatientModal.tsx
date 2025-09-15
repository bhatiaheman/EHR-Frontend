'use client';
import { useState } from 'react';
import { Patient } from '@/types/patient.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Props {
  patient: Patient;
  onClose: () => void;
  onSubmit: (data: Patient) => void;
}

export default function PatientModal({ patient, onClose, onSubmit }: Props) {
  const [editedPatient, setEditedPatient] = useState<Patient>({
    ...patient,
    firstName: patient.name.split(' ').slice(0, -1).join(' ') || '',
    lastName: patient.name.split(' ').pop() || '',
    birthDate: patient.birthDate || '',
    phone: patient.phone || '',
    email: patient.email || '',
    conditions: [], // Not submitted, managed separately
    allergies: [], // Not submitted, managed separately
    medications: [], // Not submitted, managed separately
    immunizations: [], // Not submitted, managed separately
    lastVisit: '',
    status: patient.status || 'Active',
  });
  const [errors, setErrors] = useState<{
    firstName?: string;
    phone?: string;
    email?: string;
    birthDate?: string;
  }>({});

  const validate = () => {
    const newErrors: { firstName?: string; phone?: string; email?: string; birthDate?: string } = {};
    if (!editedPatient.firstName) {
      newErrors.firstName = 'First name is required';
    } else if (editedPatient.firstName.length > 100) {
      newErrors.firstName = 'First name must be 100 characters or less';
    }
    if (editedPatient.phone && !/^\d{3}-\d{3}-\d{4}$/.test(editedPatient.phone)) {
      newErrors.phone = 'Phone must be in format XXX-XXX-XXXX (e.g., 202-555-0123)';
    }
    if (editedPatient.email && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(editedPatient.email)) {
      newErrors.email = 'Email must be a valid address (e.g., name@domain.com)';
    }
    if (!editedPatient.birthDate) {
      newErrors.birthDate = 'Birth date is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit({
      ...editedPatient,
      name: `${editedPatient.firstName} ${editedPatient.lastName}`.trim(),
      contact: editedPatient.phone || editedPatient.email || '',
      age: editedPatient.birthDate
        ? new Date().getFullYear() - new Date(editedPatient.birthDate).getFullYear()
        : 0,
      conditions: [], // Not submitted
      allergies: [], // Not submitted
      medications: [], // Not submitted
      immunizations: [], // Not submitted
      lastVisit: '',
    });
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[90%] max-w-md p-6 relative">
        <Button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          onClick={onClose}
          variant="ghost"
        >
          X
        </Button>

        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          {patient.id ? `${patient.name} Details` : 'Add Patient'}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="font-medium text-gray-600">First Name</label>
            <Input
              type="text"
              value={editedPatient.firstName}
              onChange={(e) =>
                setEditedPatient({ ...editedPatient, firstName: e.target.value })
              }
              className="border rounded px-2 py-1 w-full"
            />
            {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName}</p>}
          </div>
          <div>
            <label className="font-medium text-gray-600">Last Name</label>
            <Input
              type="text"
              value={editedPatient.lastName}
              onChange={(e) =>
                setEditedPatient({ ...editedPatient, lastName: e.target.value })
              }
              className="border rounded px-2 py-1 w-full"
            />
          </div>
          <div>
            <label className="font-medium text-gray-600">Birth Date</label>
            <Input
              type="date"
              value={editedPatient.birthDate}
              onChange={(e) =>
                setEditedPatient({ ...editedPatient, birthDate: e.target.value })
              }
              className="border rounded px-2 py-1 w-full"
            />
            {errors.birthDate && <p className="text-red-500 text-sm">{errors.birthDate}</p>}
          </div>
          <div>
            <label className="font-medium text-gray-600">Gender</label>
            <select
              value={editedPatient.gender}
              onChange={(e) =>
                setEditedPatient({ ...editedPatient, gender: e.target.value })
              }
              className="border rounded px-2 py-1 w-full"
            >
              <option value="">Select...</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>
          <div>
            <label className="font-medium text-gray-600">Phone</label>
            <Input
              type="text"
              value={editedPatient.phone}
              onChange={(e) =>
                setEditedPatient({ ...editedPatient, phone: e.target.value })
              }
              className="border rounded px-2 py-1 w-full"
              placeholder="e.g., 202-555-0123"
            />
            {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
          </div>
          <div>
            <label className="font-medium text-gray-600">Email</label>
            <Input
              type="text"
              value={editedPatient.email}
              onChange={(e) =>
                setEditedPatient({ ...editedPatient, email: e.target.value })
              }
              className="border rounded px-2 py-1 w-full"
              placeholder="e.g., john.doe@hospital.com"
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          </div>
        </div>

        <Button
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white"
          onClick={handleSubmit}
        >
          {patient.id ? 'Update' : 'Add'}
        </Button>
      </div>
    </div>
  );
}