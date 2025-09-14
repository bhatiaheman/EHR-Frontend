// PatientFormModal.tsx
"use client";
import { useState } from "react";
import { Patient } from "../../types/patient.types";

interface Props {
  patient: Patient;
  onClose: () => void;
  onSubmit: (data: Patient) => void;
}

export default function PatientFormModal({ patient, onClose, onSubmit }: Props) {
  const [editedPatient, setEditedPatient] = useState<Patient>(patient);
  const [activeTab, setActiveTab] = useState<"details" | "allergies" | "medications" | "immunizations">("details");

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
          {patient.id === 0 ? "Add Patient" : `${patient.name} Details`}
        </h2>

        {/* Tabs */}
        <div className="flex border-b mb-4">
          {["details", "allergies", "medications", "immunizations"].map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 -mb-px ${
                activeTab === tab ? "border-b-2 border-blue-500 font-semibold" : "text-gray-500"
              }`}
              onClick={() => setActiveTab(tab as any)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {/* Details Tab */}
          {activeTab === "details" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-medium">Name</label>
                <input
                  type="text"
                  value={editedPatient.name}
                  onChange={(e) =>
                    setEditedPatient({ ...editedPatient, name: e.target.value })
                  }
                  className="border rounded px-2 py-1 w-full"
                />
              </div>
              <div>
                <label className="font-medium">Age</label>
                <input
                  type="number"
                  value={editedPatient.age}
                  onChange={(e) =>
                    setEditedPatient({ ...editedPatient, age: Number(e.target.value) })
                  }
                  className="border rounded px-2 py-1 w-full"
                />
              </div>
              <div>
                <label className="font-medium">Gender</label>
                <input
                  type="text"
                  value={editedPatient.gender}
                  onChange={(e) =>
                    setEditedPatient({ ...editedPatient, gender: e.target.value })
                  }
                  className="border rounded px-2 py-1 w-full"
                />
              </div>
              <div>
                <label className="font-medium">Contact</label>
                <input
                  type="text"
                  value={editedPatient.contact}
                  onChange={(e) =>
                    setEditedPatient({ ...editedPatient, contact: e.target.value })
                  }
                  className="border rounded px-2 py-1 w-full"
                />
              </div>
              <div>
                <label className="font-medium">Conditions</label>
                <input
                  type="text"
                  value={editedPatient.conditions.join(", ")}
                  onChange={(e) =>
                    setEditedPatient({
                      ...editedPatient,
                      conditions: e.target.value.split(",").map((c) => c.trim()),
                    })
                  }
                  className="border rounded px-2 py-1 w-full"
                />
              </div>

              <div>
                <label className="font-medium">Last Visit</label>
                <input
                  type="date"
                  value={editedPatient.lastVisit}
                  onChange={(e) =>
                    setEditedPatient({ ...editedPatient, lastVisit: e.target.value })
                  }
                  className="border rounded px-2 py-1 w-full"
                />
              </div>
            </div>
          )}

          {/* Allergies Tab */}
          {activeTab === "allergies" && (
            <div className="space-y-2">
              {editedPatient.allergies.map((a, idx) => (
                <input
                  key={idx}
                  type="text"
                  value={a}
                  onChange={(e) =>
                    setEditedPatient({
                      ...editedPatient,
                      allergies: editedPatient.allergies.map((al, i) =>
                        i === idx ? e.target.value : al
                      ),
                    })
                  }
                  className="border rounded px-2 py-1 w-full"
                />
              ))}
              <button
                type="button"
                className="px-3 py-1 bg-green-500 text-white rounded"
                onClick={() =>
                  setEditedPatient({
                    ...editedPatient,
                    allergies: [...editedPatient.allergies, ""],
                  })
                }
              >
                + Add Allergy
              </button>
            </div>
          )}

          {/* Medications Tab */}
          {activeTab === "medications" && (
            <div className="space-y-2">
              {editedPatient.medications.map((m, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={m.name}
                    onChange={(e) =>
                      setEditedPatient({
                        ...editedPatient,
                        medications: editedPatient.medications.map((med, i) =>
                          i === idx ? { ...med, name: e.target.value } : med
                        ),
                      })
                    }
                    className="border rounded px-2 py-1 flex-1"
                  />
                  <input
                    type="text"
                    value={m.dose}
                    onChange={(e) =>
                      setEditedPatient({
                        ...editedPatient,
                        medications: editedPatient.medications.map((med, i) =>
                          i === idx ? { ...med, dose: e.target.value } : med
                        ),
                      })
                    }
                    className="border rounded px-2 py-1 flex-1"
                  />
                </div>
              ))}
              <button
                type="button"
                className="px-3 py-1 bg-green-500 text-white rounded"
                onClick={() =>
                  setEditedPatient({
                    ...editedPatient,
                    medications: [...editedPatient.medications, { name: "", dose: "" }],
                  })
                }
              >
                + Add Medication
              </button>
            </div>
          )}

          {/* Immunizations Tab */}
          {activeTab === "immunizations" && (
            <div className="space-y-2">
              {editedPatient.immunizations.map((imm, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={imm.vaccine}
                    onChange={(e) =>
                      setEditedPatient({
                        ...editedPatient,
                        immunizations: editedPatient.immunizations.map((i, iidx) =>
                          iidx === idx ? { ...i, vaccine: e.target.value } : i
                        ),
                      })
                    }
                    className="border rounded px-2 py-1 flex-1"
                  />
                  <input
                    type="text"
                    value={imm.status}
                    onChange={(e) =>
                      setEditedPatient({
                        ...editedPatient,
                        immunizations: editedPatient.immunizations.map((i, iidx) =>
                          iidx === idx ? { ...i, status: e.target.value } : i
                        ),
                      })
                    }
                    className="border rounded px-2 py-1 flex-1"
                  />
                </div>
              ))}
              <button
                type="button"
                className="px-3 py-1 bg-green-500 text-white rounded"
                onClick={() =>
                  setEditedPatient({
                    ...editedPatient,
                    immunizations: [...editedPatient.immunizations, { vaccine: "", status: "" }],
                  })
                }
              >
                + Add Immunization
              </button>
            </div>
          )}
        </div>

        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => onSubmit(editedPatient)}
        >
          {patient.id === 0 ? "Add Patient" : "Update"}
        </button>
      </div>
    </div>
  );
}
