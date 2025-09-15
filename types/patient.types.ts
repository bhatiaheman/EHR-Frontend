export interface Patient {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  age: number;
  gender: string;
  contact: string;
  phone?: string;
  email?: string;
  birthDate?: string;
  conditions: string[];
  allergies: string[]; 
  medications: { name: string; dose: string }[]; 
  immunizations: { vaccine: string; status: string }[];
  lastVisit?: string;
  status: string;

  fhirMedications?: MedicationStatement[];
  fhirConditions?: Condition[];
}

export interface MedicationStatement {
  id: string;
  status: string; 
  medicationCodeableConcept: { coding: { system: string; code: string; display: string }[] };
  effectiveDateTime?: string;
  subject: { reference: string };
}


export interface Condition {
  id: string;
  clinicalStatus: { coding: { system: string; code: string; display: string }[] };
  code: { coding: { system: string; code: string; display: string }[] };
  subject: { reference: string }; 
  recordedDate?: string;
}