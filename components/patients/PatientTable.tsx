'use client';
import { useState } from 'react';
import { Patient } from '@/types/patient.types';
import { HiOutlineEye } from 'react-icons/hi';
import Link from 'next/link';

interface Props {
  patients: Patient[];
  onEdit: (patient: Patient) => void;
}

export default function PatientTable({ patients, onEdit }: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const patientsPerPage = 10;

  const totalPages = Math.ceil(patients.length / patientsPerPage);
  const startIndex = (currentPage - 1) * patientsPerPage;
  const currentPatients = patients.slice(startIndex, startIndex + patientsPerPage);

  return (
    <>
      <div className="overflow-x-auto border rounded-lg shadow-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              {['ID', 'Name', 'Age', 'Gender', 'Contact', 'Actions'].map((h) => (
                <th
                  key={h}
                  className="px-4 py-2 text-left text-gray-700 uppercase text-sm font-medium"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentPatients.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-2">{p.id}</td>
                <td className="px-4 py-2">
                  <Link href={`/dashboard/patients/${p.id}`} className="text-blue-600 hover:underline">
                    {p.name}
                  </Link>
                </td>
                <td className="px-4 py-2">{p.age}</td>
                <td className="px-4 py-2">{p.gender}</td>
                <td className="px-4 py-2">{p.contact}</td>
                <td className="px-4 py-2">
                  <HiOutlineEye
                    size={22}
                    className="cursor-pointer text-gray-600 hover:text-blue-500"
                    onClick={() => onEdit(p)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <p className="text-sm text-gray-600">
          Showing {startIndex + 1}–{Math.min(startIndex + patientsPerPage, patients.length)} of{' '}
          {patients.length}
        </p>
        <div className="flex gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 border rounded ${
                currentPage === i + 1 ? 'bg-blue-500 text-white' : ''
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
}