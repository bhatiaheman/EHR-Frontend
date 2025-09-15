"use client";

import { useState } from "react";
import { Appointment } from "@/types/appointment.types";

interface Props {
  appointment?: Appointment; 
  onClose: () => void;
  onSubmit: (data: Appointment) => void;
}

export default function AppointmentFormModal({ appointment, onClose, onSubmit }: Props) {
  const [edited, setEdited] = useState<Appointment>({
    id: appointment?.id || 0,
    patientId: appointment?.patientId || 0,
    patientName: appointment?.patientName || "",
    providerId: appointment?.providerId || 0,
    providerName: appointment?.providerName || "",
    date: appointment?.date || "",
    time: appointment?.time || "",
    type: appointment?.type || "Consultation",
    status: appointment?.status || "Scheduled",
    notes: appointment?.notes || "",
  });

  const typeOptions = ["Consultation", "Follow-up", "Procedure", "Other"];
  const statusOptions = ["Scheduled", "Completed", "Cancelled"];

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[90%] max-w-3xl p-6 relative">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          X
        </button>

        <h2 className="text-2xl font-semibold mb-4">
          {appointment ? "Update Appointment" : "Add Appointment"}
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-medium">Patient Name</label>
            <input
              type="text"
              value={edited.patientName}
              onChange={(e) => setEdited({ ...edited, patientName: e.target.value })}
              className="border rounded px-2 py-1 w-full"
            />
          </div>

          <div>
            <label className="font-medium">Provider Name</label>
            <input
              type="text"
              value={edited.providerName}
              onChange={(e) => setEdited({ ...edited, providerName: e.target.value })}
              className="border rounded px-2 py-1 w-full"
            />
          </div>

          <div>
            <label className="font-medium">Date</label>
            <input
              type="date"
              value={edited.date}
              onChange={(e) => setEdited({ ...edited, date: e.target.value })}
              className="border rounded px-2 py-1 w-full"
            />
          </div>

          <div>
            <label className="font-medium">Time</label>
            <input
              type="time"
              value={edited.time}
              onChange={(e) => setEdited({ ...edited, time: e.target.value })}
              className="border rounded px-2 py-1 w-full"
            />
          </div>

          <div>
            <label className="font-medium">Type</label>
            <select
              value={edited.type}
              onChange={(e) =>
                setEdited({ ...edited, type: e.target.value as Appointment["type"] })
              }
              className="border rounded px-2 py-1 w-full"
            >
              {typeOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-medium">Status</label>
            <select
              value={edited.status}
              onChange={(e) =>
                setEdited({ ...edited, status: e.target.value as Appointment["status"] })
              }
              className="border rounded px-2 py-1 w-full"
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-2">
            <label className="font-medium">Notes</label>
            <textarea
              value={edited.notes || ""}
              onChange={(e) => setEdited({ ...edited, notes: e.target.value })}
              className="border rounded px-2 py-1 w-full"
              rows={3}
            />
          </div>
        </div>

        <button
          onClick={() => onSubmit(edited)}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {appointment ? "Update Appointment" : "Add Appointment"}
        </button>
      </div>
    </div>
  );
}
