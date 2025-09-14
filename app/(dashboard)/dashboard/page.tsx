"use client";

import React, { useEffect, useState } from "react";
import { FiUsers } from "react-icons/fi";
import { SlCalender } from "react-icons/sl";
import { SiMoneygram } from "react-icons/si";
import { ImLab } from "react-icons/im";
import { TbEdit } from "react-icons/tb";

interface CardData {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
}

interface Patient {
  id: number;
  name: string;
  age: number;
  conditions: string;
  lastVisit: string;
  status: string;
}

const statusOptions = ["Active", "Pending", "Critical", "Recovered"];

const statusColors: Record<string, string> = {
  Active: "bg-green-500/80",
  Pending: "bg-yellow-500/80",
  Critical: "bg-red-500/80",
  Recovered: "bg-blue-500/80",
};

const Dashboard = () => {

  const [cards, setCards] = useState<CardData[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const patientsPerPage = 10;

  useEffect(() => {
    const cardsResponse: CardData[] = [
      { title: "Total Patients", value: 1245, change: 5, icon: <FiUsers /> },
      { title: "Active Appointments", value: 320, change: -2, icon: <SlCalender /> },
      { title: "Pending Lab Results", value: 180, change: 3, icon: <ImLab /> },
      { title: "Monthly Revenue", value: "$45,231", change: -1, icon: <SiMoneygram /> },
    ];
    setCards(cardsResponse);

    const patientsResponse: Patient[] = Array.from({ length: 45 }, (_, i) => ({
      id: i + 1,
      name: `Patient ${i + 1}`,
      age: 20 + (i % 40),
      conditions: i % 3 === 0 ? "Diabetes" : i % 2 === 0 ? "Hypertension" : "Asthma",
      lastVisit: `2024-0${(i % 9) + 1}-15`,
      status: statusOptions[i % 4],
    }));

    setPatients(patientsResponse);
  }, []);

  const handleStatusChange = async (patientId: number, newStatus: string) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === patientId ? { ...p, status: newStatus } : p))
    );
    setOpenDropdownId(null);
  };

  const totalPages = Math.ceil(patients.length / patientsPerPage);
  const startIndex = (currentPage - 1) * patientsPerPage;
  const currentPatients = patients.slice(startIndex, startIndex + patientsPerPage);

  return (
    <div className="flex flex-col h-screen gap-4">

      <div className="flex flex-col mt-4">
        <div className="pl-6 space-y-2">
          <h1 className="text-4xl font-semibold">DashBoard</h1>
          <h3 className="text-xl text-muted-foreground">
            Welcome back, Dr. Smith. Here's your patient overview.
          </h3>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 grid-cols-2 gap-4 mx-4 my-6">
        {cards.map((card) => (
          <div
            key={card.title}
            className="flex flex-col border rounded-lg px-6 py-8 shadow-md bg-gray-300/30"
          >
            <div className="flex items-center justify-between">
              <h3>{card.title}</h3>
              <span className="text-gray-500">{card.icon}</span>
            </div>
            <h1 className="text-3xl font-bold">{card.value}</h1>
            <p className={card.change >= 0 ? "text-green-500" : "text-red-500"}>
              {card.change >= 0 ? "+" : ""}
              {card.change}% since last month
            </p>
          </div>
        ))}
      </div>

      <div className="mx-4 my-2 px-4 py-8 border rounded-lg shadow-md bg-gray-300/30">
        <h3 className="text-lg font-semibold mb-4">Recent Patients</h3>
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Age</th>
              <th className="text-left p-2">Conditions</th>
              <th className="text-left p-2">Last Visit</th>
              <th className="text-left p-2">Status</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentPatients.map((patient) => (
              <tr key={patient.id} className="border-t border-gray-200">
                <td className="p-2">{patient.name}</td>
                <td className="p-2">{patient.age}</td>
                <td className="p-2">{patient.conditions}</td>
                <td className="p-2">{patient.lastVisit}</td>
                <td
                  className={`text-white flex items-center justify-center py-1 my-2 rounded-lg ${statusColors[patient.status]}`}
                >
                  {patient.status}
                </td>
                <td className="p-2 relative">
                  <TbEdit
                    size={20}
                    className="cursor-pointer"
                    onClick={() =>
                      setOpenDropdownId(
                        openDropdownId === patient.id ? null : patient.id
                      )
                    }
                  />
                  {openDropdownId === patient.id && (
                    <div className="absolute top-6 left-4 bg-white border rounded-lg shadow-md z-10">
                      {statusOptions.map((status) => (
                        <div
                          key={status}
                          className={`px-4 py-1 m-2 cursor-pointer border rounded-md hover:bg-gray-300/95 ${statusColors[status]} text-white`}
                          onClick={() =>
                            handleStatusChange(patient.id, status)
                          }
                        >
                          {status}
                        </div>
                      ))}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-between items-center mt-4">
          <p className="text-sm text-gray-600">
            Showing {startIndex + 1}–{Math.min(startIndex + patientsPerPage, patients.length)} of{" "}
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
      </div>
    </div>
  );
};

export default Dashboard;
