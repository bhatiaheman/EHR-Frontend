export let mockPatients = [
  // Same as before
  {
    id: "123",
    name: "John Doe",
    firstName: "John",
    lastName: "Doe",
    age: 45,
    birthDate: "1980-03-15",
    gender: "male",
    contact: "tel:+12025550123",
    phone: "tel:+12025550123",
    email: "john.doe@example.com",
    conditions: ["Hypertension", "Diabetes"],
    allergies: ["Penicillin"],
    medications: [
      { name: "Lisinopril", dose: "10 mg daily" },
      { name: "Metformin", dose: "500 mg twice daily" },
    ],
    immunizations: [{ vaccine: "Influenza", status: "completed" }],
    lastVisit: "2025-08-01T10:00:00Z",
    status: "Active",
    fhirMedications: [
      {
        id: "med-001",
        status: "active",
        medicationCodeableConcept: {
          coding: [{ system: "http://snomed.info/sct", code: "314076", display: "Lisinopril" }],
        },
        subject: { reference: "Patient/123" },
        effectiveDateTime: "2025-01-01T00:00:00Z",
      },
      {
        id: "med-002",
        status: "active",
        medicationCodeableConcept: {
          coding: [{ system: "http://snomed.info/sct", code: "315286", display: "Metformin" }],
        },
        subject: { reference: "Patient/123" },
        effectiveDateTime: "2025-01-01T00:00:00Z",
      },
    ],
    fhirAllergies: [
      {
        id: "allergy-001",
        clinicalStatus: {
          coding: [{ system: "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical", code: "active" }],
        },
        code: {
          coding: [{ system: "http://snomed.info/sct", code: "373270004", display: "Penicillin" }],
        },
        patient: { reference: "Patient/123" },
        recordedDate: "2025-01-01T00:00:00Z",
      },
    ],
    fhirConditions: [
      {
        id: "condition-001",
        clinicalStatus: {
          coding: [{ system: "http://terminology.hl7.org/CodeSystem/condition-clinical", code: "active" }],
        },
        code: {
          coding: [{ system: "http://hl7.org/fhir/sid/icd-10", code: "I10", display: "Hypertension" }],
        },
        subject: { reference: "Patient/123" },
        recordedDate: "2025-01-01T00:00:00Z",
      },
      {
        id: "condition-002",
        clinicalStatus: {
          coding: [{ system: "http://terminology.hl7.org/CodeSystem/condition-clinical", code: "active" }],
        },
        code: {
          coding: [{ system: "http://hl7.org/fhir/sid/icd-10", code: "E11.9", display: "Diabetes" }],
        },
        subject: { reference: "Patient/123" },
        recordedDate: "2025-01-01T00:00:00Z",
      },
    ],
  },
  {
    id: "124",
    name: "Jane Smith",
    firstName: "Jane",
    lastName: "Smith",
    age: 32,
    birthDate: "1993-07-22",
    gender: "female",
    contact: "tel:+12025550124",
    phone: "tel:+12025550124",
    email: "jane.smith@example.com",
    conditions: ["Asthma"],
    allergies: ["Peanuts"],
    medications: [{ name: "Albuterol", dose: "2 puffs as needed" }],
    immunizations: [{ vaccine: "Tetanus", status: "completed" }],
    lastVisit: "2025-07-15T14:30:00Z",
    status: "Active",
    fhirMedications: [
      {
        id: "med-003",
        status: "active",
        medicationCodeableConcept: {
          coding: [{ system: "http://snomed.info/sct", code: "372897005", display: "Albuterol" }],
        },
        subject: { reference: "Patient/124" },
        effectiveDateTime: "2025-01-01T00:00:00Z",
      },
    ],
    fhirAllergies: [
      {
        id: "allergy-002",
        clinicalStatus: {
          coding: [{ system: "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical", code: "active" }],
        },
        code: {
          coding: [{ system: "http://snomed.info/sct", code: "256440004", display: "Peanuts" }],
        },
        patient: { reference: "Patient/124" },
        recordedDate: "2025-01-01T00:00:00Z",
      },
    ],
    fhirConditions: [
      {
        id: "condition-003",
        clinicalStatus: {
          coding: [{ system: "http://terminology.hl7.org/CodeSystem/condition-clinical", code: "active" }],
        },
        code: {
          coding: [{ system: "http://hl7.org/fhir/sid/icd-10", code: "J45.909", display: "Asthma" }],
        },
        subject: { reference: "Patient/124" },
        recordedDate: "2025-01-01T00:00:00Z",
      },
    ],
  },
];

export let mockMedicationStatements = [
  // Same as mockPatients.fhirMedications
  {
    id: "med-001",
    status: "active",
    medicationCodeableConcept: {
      coding: [{ system: "http://snomed.info/sct", code: "314076", display: "Lisinopril" }],
    },
    subject: { reference: "Patient/123" },
    effectiveDateTime: "2025-01-01T00:00:00Z",
  },
  {
    id: "med-002",
    status: "active",
    medicationCodeableConcept: {
      coding: [{ system: "http://snomed.info/sct", code: "315286", display: "Metformin" }],
    },
    subject: { reference: "Patient/123" },
    effectiveDateTime: "2025-01-01T00:00:00Z",
  },
  {
    id: "med-003",
    status: "active",
    medicationCodeableConcept: {
      coding: [{ system: "http://snomed.info/sct", code: "372897005", display: "Albuterol" }],
    },
    subject: { reference: "Patient/124" },
    effectiveDateTime: "2025-01-01T00:00:00Z",
  },
];

export let mockAllergyIntolerances = [
  {
    id: "allergy-001",
    clinicalStatus: {
      coding: [{ system: "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical", code: "active" }],
    },
    code: {
      coding: [{ system: "http://snomed.info/sct", code: "373270004", display: "Penicillin" }],
    },
    patient: { reference: "Patient/123" },
    recordedDate: "2025-01-01T00:00:00Z",
  },
  {
    id: "allergy-002",
    clinicalStatus: {
      coding: [{ system: "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical", code: "active" }],
    },
    code: {
      coding: [{ system: "http://snomed.info/sct", code: "256440004", display: "Peanuts" }],
    },
    patient: { reference: "Patient/124" },
    recordedDate: "2025-01-01T00:00:00Z",
  },
];

export let mockConditions = [
  {
    id: "condition-001",
    clinicalStatus: {
      coding: [{ system: "http://terminology.hl7.org/CodeSystem/condition-clinical", code: "active" }],
    },
    code: {
      coding: [{ system: "http://hl7.org/fhir/sid/icd-10", code: "I10", display: "Hypertension" }],
    },
    subject: { reference: "Patient/123" },
    recordedDate: "2025-01-01T00:00:00Z",
  },
  {
    id: "condition-002",
    clinicalStatus: {
      coding: [{ system: "http://terminology.hl7.org/CodeSystem/condition-clinical", code: "active" }],
    },
    code: {
      coding: [{ system: "http://hl7.org/fhir/sid/icd-10", code: "E11.9", display: "Diabetes" }],
    },
    subject: { reference: "Patient/123" },
    recordedDate: "2025-01-01T00:00:00Z",
  },
  {
    id: "condition-003",
    clinicalStatus: {
      coding: [{ system: "http://terminology.hl7.org/CodeSystem/condition-clinical", code: "active" }],
    },
    code: {
      coding: [{ system: "http://hl7.org/fhir/sid/icd-10", code: "J45.909", display: "Asthma" }],
    },
    subject: { reference: "Patient/124" },
    recordedDate: "2025-01-01T00:00:00Z",
  },
];

// Functions to update mock data
export const addMockMedicationStatement = (resource: any) => {
  mockMedicationStatements.push(resource);
};

export const updateMockMedicationStatement = (id: string, resource: any) => {
  const index = mockMedicationStatements.findIndex(m => m.id === id);
  if (index !== -1) {
    mockMedicationStatements[index] = resource;
  }
};

export const addMockAllergyIntolerance = (resource: any) => {
  mockAllergyIntolerances.push(resource);
};

export const updateMockAllergyIntolerance = (id: string, resource: any) => {
  const index = mockAllergyIntolerances.findIndex(a => a.id === id);
  if (index !== -1) {
    mockAllergyIntolerances[index] = resource;
  }
};

export const addMockCondition = (resource: any) => {
  mockConditions.push(resource);
};

export const updateMockCondition = (id: string, resource: any) => {
  const index = mockConditions.findIndex(c => c.id === id);
  if (index !== -1) {
    mockConditions[index] = resource;
  }
};