export interface Medication {
  name: string;
  dose: string;
}

export interface Immunization {
  vaccine: string;
  status: string;
}

export interface Patient {
  id: number;
  name: string;
  age: number;
  gender: string;
  contact: string;
  conditions: string[];
  allergies: string[];
  medications: Medication[];
  immunizations: Immunization[];
  lastVisit: string;
  status: string;
}
