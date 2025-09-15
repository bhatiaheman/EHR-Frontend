"use client";

import { useState } from "react";
import { HiOutlineEye } from "react-icons/hi";
import { Appointment } from "@/types/appointment.types";
import AppointmentModal from "./AppointmentModal"; // create a modal similar to PatientModal for appointments

interface Props {
  appointments: Appointment[];
}

const statusColors: Record<string, string> = {
  Scheduled: "bg-blue-500",
  Completed: "bg-green-500",
  Cancelled: "bg-red-500",
};

export default function AppointmentTable({ appointments }: Props) {
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const appointmentsPerPage = 10;

  const totalPages = Math.ceil(appointments.length / appointmentsPerPage);
  const startIndex = (currentPage - 1) * appointmentsPerPage;
  const currentAppointments = appointments.slice(startIndex, startIndex + appointmentsPerPage);

  return (
    <>
      <div className="overflow-x-auto border rounded-lg shadow-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              {["ID", "Patient", "Provider", "Date", "Time", "Type", "Status", "Actions"].map((h) => (
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
            {currentAppointments.map((a) => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="px-4 py-2">{a.id}</td>
                <td className="px-4 py-2">{a.patientName}</td>
                <td className="px-4 py-2">{a.providerName}</td>
                <td className="px-4 py-2">{a.date}</td>
                <td className="px-4 py-2">{a.time}</td>
                <td className="px-4 py-2">{a.type}</td>
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-1 text-xs rounded-full text-white ${
                      statusColors[a.status] || "bg-gray-500"
                    }`}
                  >
                    {a.status}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <HiOutlineEye
                    size={22}
                    className="cursor-pointer text-gray-600 hover:text-blue-500"
                    onClick={() => setSelectedAppointment(a)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


      {selectedAppointment && (
        <AppointmentModal
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onSubmit={(updated) => {
            setSelectedAppointment(null);
          }}
        />
      )}


      <div className="flex justify-between items-center mt-4">
        <p className="text-sm text-gray-600">
          Showing {startIndex + 1}–{Math.min(startIndex + appointmentsPerPage, appointments.length)} of{" "}
          {appointments.length}
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
                currentPage === i + 1 ? "bg-blue-500 text-white" : ""
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
