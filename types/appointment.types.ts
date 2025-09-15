
export interface Appointment {
  id: number;
  patientId: number;
  patientName: string;
  providerId: number;
  providerName: string;
  date: string;
  time: string; 
  type: "Consultation" | "Follow-up" | "Procedure" | "Other"; 
  status: "Scheduled" | "Completed" | "Cancelled";
  notes?: string;
}
