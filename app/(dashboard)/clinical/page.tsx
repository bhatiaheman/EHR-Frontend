'use client';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePatient } from '@/hooks/usePatients';
import {
  useMedicationStatements,
  useAddMedicationStatement,
  useUpdateMedicationStatement,
  useAllergyIntolerances,
  useAddAllergyIntolerance,
  useUpdateAllergyIntolerance,
  useConditions,
  useAddCondition,
  useUpdateCondition,
} from '@/hooks/useClinical';
import toast from 'react-hot-toast';

const ClinicalOperationsPage = ({ patientId }: { patientId: string }) => {
  const { data: patient } = usePatient(patientId);
  const [activeTab, setActiveTab] = useState('medications');
  const [showMedModal, setShowMedModal] = useState(false);
  const [showAllergyModal, setShowAllergyModal] = useState(false);
  const [showConditionModal, setShowConditionModal] = useState(false);
  const [editMedId, setEditMedId] = useState<string | null>(null);
  const [editAllergyId, setEditAllergyId] = useState<string | null>(null);
  const [editConditionId, setEditConditionId] = useState<string | null>(null);
  const [medForm, setMedForm] = useState({ medication: '', medicationCode: '', status: 'active', effectiveDateTime: '', patientId: patientId });
  const [allergyForm, setAllergyForm] = useState({ allergy: '', allergyCode: '', clinicalStatus: 'active' });
  const [conditionForm, setConditionForm] = useState({
    condition: '',
    conditionCode: '',
    codeSystem: 'http://hl7.org/fhir/sid/icd-10',
    clinicalStatus: 'active',
  });

  const { data: medicationsData } = useMedicationStatements(patientId, 10, 1);
  const { data: allergies } = useAllergyIntolerances(patientId);
  const { data: conditions } = useConditions(patientId);

  const addMedication = useAddMedicationStatement();
  const updateMedication = useUpdateMedicationStatement();
  const addAllergy = useAddAllergyIntolerance();
  const updateAllergy = useUpdateAllergyIntolerance();
  const addCondition = useAddCondition();
  const updateCondition = useUpdateCondition();

  // Validation functions
  const validateSnomedCode = (code: string) => /^[0-9]{6,}$/.test(code);
  const validateIcd10Code = (code: string) => /^[A-Z][0-9]{1,2}(\.[0-9]{1,4})?$/.test(code);
  const validateDateTime = (date: string) => {
    const dateObj = new Date(date);
    return !isNaN(dateObj.getTime()) && dateObj.toISOString() === date;
  };

  const handleMedSubmit = () => {
    if (!medForm.medication || !medForm.medicationCode || !medForm.status || !medForm.effectiveDateTime) {
      toast.error('All medication fields, including effective date, are required');
      return;
    }
    if (!validateSnomedCode(medForm.medicationCode)) {
      toast.error('Invalid SNOMED code (must be 6+ digits)');
      return;
    }
    if (!validateDateTime(medForm.effectiveDateTime)) {
      toast.error('Invalid effective date (must be ISO format, e.g., 2025-09-15T10:00:00Z)');
      return;
    }
    if (editMedId) {
      updateMedication.mutate({
        id: editMedId,
        data: {
          resourceType: 'MedicationStatement',
          id: editMedId,
          status: medForm.status,
          medicationCodeableConcept: {
            coding: [{ system: 'http://snomed.info/sct', code: medForm.medicationCode, display: medForm.medication }],
          },
          subject: { reference: `Patient/${patientId}` },
          effectiveDateTime: medForm.effectiveDateTime,
          patientId: patientId,
        },
      });
    } else {
      addMedication.mutate({ patientId, ...medForm });
    }
    setShowMedModal(false);
    setEditMedId(null);
    setMedForm({ medication: '', medicationCode: '', status: 'active', effectiveDateTime: '', patientId: patientId });
  };

  const handleAllergySubmit = () => {
    if (!allergyForm.allergy || !allergyForm.allergyCode) {
      toast.error('Allergy and code are required');
      return;
    }
    if (!validateSnomedCode(allergyForm.allergyCode)) {
      toast.error('Invalid SNOMED code (must be 6+ digits)');
      return;
    }
    if (editAllergyId) {
      updateAllergy.mutate({
        id: editAllergyId,
        data: {
          resourceType: 'AllergyIntolerance',
          id: editAllergyId,
          clinicalStatus: {
            coding: [
              { system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical', code: allergyForm.clinicalStatus },
            ],
          },
          code: {
            coding: [{ system: 'http://snomed.info/sct', code: allergyForm.allergyCode, display: allergyForm.allergy }],
          },
          patient: { reference: `Patient/${patientId}` },
          recordedDate: new Date().toISOString(),
        },
      });
    } else {
      addAllergy.mutate({ patientId, ...allergyForm });
    }
    setShowAllergyModal(false);
    setEditAllergyId(null);
    setAllergyForm({ allergy: '', allergyCode: '', clinicalStatus: 'active' });
  };

  const handleConditionSubmit = () => {
    if (!conditionForm.condition || !conditionForm.conditionCode) {
      toast.error('Condition and code are required');
      return;
    }
    if (!validateIcd10Code(conditionForm.conditionCode)) {
      toast.error('Invalid ICD-10 code (e.g., J45.909)');
      return;
    }
    if (editConditionId) {
      updateCondition.mutate({
        id: editConditionId,
        data: {
          resourceType: 'Condition',
          id: editConditionId,
          clinicalStatus: {
            coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-clinical', code: conditionForm.clinicalStatus }],
          },
          code: {
            coding: [{ system: conditionForm.codeSystem, code: conditionForm.conditionCode, display: conditionForm.condition }],
          },
          subject: { reference: `Patient/${patientId}` },
          recordedDate: new Date().toISOString(),
        },
      });
    } else {
      addCondition.mutate({ patientId, ...conditionForm });
    }
    setShowConditionModal(false);
    setEditConditionId(null);
    setConditionForm({ condition: '', conditionCode: '', codeSystem: 'http://hl7.org/fhir/sid/icd-10', clinicalStatus: 'active' });
  };

  return (
    <div className="flex flex-col gap-8 m-6">
      <div>
        <h1 className="text-4xl font-semibold">Clinical Operations</h1>
        <p className="text-xl text-gray-600">Manage clinical data for patient</p>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-blue-500 text-white">
          <TabsTrigger value="medications">Medications</TabsTrigger>
          <TabsTrigger value="allergies">Allergies</TabsTrigger>
          <TabsTrigger value="conditions">Conditions</TabsTrigger>
        </TabsList>

        <TabsContent value="medications">
          <div className="flex justify-between mb-4">
            <h2 className="text-2xl font-semibold">Medication Statements</h2>
            <Button onClick={() => setShowMedModal(true)}>Add Medication</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-gray-700">ID</th>
                  <th className="px-4 py-2 text-left text-gray-700">Medication</th>
                  <th className="px-4 py-2 text-left text-gray-700">Patient Name</th>
                  <th className="px-4 py-2 text-left text-gray-700">Status</th>
                  <th className="px-4 py-2 text-left text-gray-700">Effective Date</th>
                  <th className="px-4 py-2 text-left text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {medicationsData?.items?.map((med) => (
                  <tr key={med.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{med.id}</td>
                    <td className="px-4 py-2">{med.medicationCodeableConcept?.coding[0]?.display || 'N/A'}</td>
                    <td className="px-4 py-2">{patient?.name}</td>
                    <td className="px-4 py-2">{med.status}</td>
                    <td className="px-4 py-2">{med.effectiveDateTime}</td>
                    <td className="px-4 py-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditMedId(med.id);
                          setMedForm({
                            medication: med.medicationCodeableConcept?.coding[0]?.display || '',
                            medicationCode: med.medicationCodeableConcept?.coding[0]?.code || '',
                            status: med.status,
                            effectiveDateTime: med.effectiveDateTime || '',
                          });
                          setShowMedModal(true);
                        }}
                      >
                        Edit
                      </Button>
                    </td>
                  </tr>
                )) || <tr><td colSpan={5}>No medications found</td></tr>}
              </tbody>
            </table>
          </div>
          {showMedModal && (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg max-w-md w-full">
                <h2 className="text-xl font-semibold mb-4">{editMedId ? 'Edit' : 'Add'} Medication Statement for {patient?.name || 'Unknown Patient'}</h2>
                <Input
                  placeholder="Medication (e.g., Aspirin)"
                  value={medForm.medication}
                  onChange={(e) => setMedForm({ ...medForm, medication: e.target.value })}
                  className="mb-2"
                />
                <Input
                  placeholder="SNOMED Code (e.g., 315286)"
                  value={medForm.medicationCode}
                  onChange={(e) => setMedForm({ ...medForm, medicationCode: e.target.value })}
                  className="mb-2"
                />
                <Input
                  placeholder="Status (e.g., active)"
                  value={medForm.status}
                  onChange={(e) => setMedForm({ ...medForm, status: e.target.value })}
                  className="mb-2"
                />
                <Input
                  type="text"
                  placeholder="Effective Date (e.g., 2025-09-15T10:00:00Z)"
                  value={medForm.effectiveDateTime}
                  onChange={(e) => setMedForm({ ...medForm, effectiveDateTime: e.target.value })}
                  className="mb-4"
                />
                <div className="flex gap-2">
                  <Button onClick={handleMedSubmit}>Save</Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowMedModal(false);
                      setEditMedId(null);
                      setMedForm({ medication: '', medicationCode: '', status: 'active', effectiveDateTime: '' });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="allergies">
          <div className="flex justify-between mb-4">
            <h2 className="text-2xl font-semibold">Allergy Intolerances</h2>
            <Button onClick={() => setShowAllergyModal(true)}>Add Allergy</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-gray-700">ID</th>
                  <th className="px-4 py-2 text-left text-gray-700">Allergy</th>
                  <th className="px-4 py-2 text-left text-gray-700">Status</th>
                  <th className="px-4 py-2 text-left text-gray-700">Recorded Date</th>
                  <th className="px-4 py-2 text-left text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allergies?.map((allergy) => (
                  <tr key={allergy.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{allergy.id}</td>
                    <td className="px-4 py-2">{allergy.code.coding[0]?.display || 'N/A'}</td>
                    <td className="px-4 py-2">{allergy.clinicalStatus.coding[0]?.code}</td>
                    <td className="px-4 py-2">{allergy.recordedDate}</td>
                    <td className="px-4 py-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditAllergyId(allergy.id);
                          setAllergyForm({
                            allergy: allergy.code.coding[0]?.display || '',
                            allergyCode: allergy.code.coding[0]?.code || '',
                            clinicalStatus: allergy.clinicalStatus.coding[0]?.code || 'active',
                          });
                          setShowAllergyModal(true);
                        }}
                      >
                        Edit
                      </Button>
                    </td>
                  </tr>
                )) || <tr><td colSpan={5}>No allergies found</td></tr>}
              </tbody>
            </table>
          </div>
          {showAllergyModal && (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg max-w-md w-full">
                <h2 className="text-xl font-semibold mb-4">{editAllergyId ? 'Edit' : 'Add'} Allergy Intolerance for {patient?.name || 'Unknown Patient'}</h2>
                <Input
                  placeholder="Allergy (e.g., Penicillin)"
                  value={allergyForm.allergy}
                  onChange={(e) => setAllergyForm({ ...allergyForm, allergy: e.target.value })}
                  className="mb-2"
                />
                <Input
                  placeholder="SNOMED Code (e.g., 373270004)"
                  value={allergyForm.allergyCode}
                  onChange={(e) => setAllergyForm({ ...allergyForm, allergyCode: e.target.value })}
                  className="mb-4"
                />
                <div className="flex gap-2">
                  <Button onClick={handleAllergySubmit}>Save</Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAllergyModal(false);
                      setEditAllergyId(null);
                      setAllergyForm({ allergy: '', allergyCode: '', clinicalStatus: 'active' });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="conditions">
          <div className="flex justify-between mb-4">
            <h2 className="text-2xl font-semibold">Conditions</h2>
            <Button onClick={() => setShowConditionModal(true)}>Add Condition</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-gray-700">ID</th>
                  <th className="px-4 py-2 text-left text-gray-700">Condition</th>
                  <th className="px-4 py-2 text-left text-gray-700">Status</th>
                  <th className="px-4 py-2 text-left text-gray-700">Recorded Date</th>
                  <th className="px-4 py-2 text-left text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {conditions?.map((condition) => (
                  <tr key={condition.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{condition.id}</td>
                    <td className="px-4 py-2">{condition.code.coding[0]?.display || 'N/A'}</td>
                    <td className="px-4 py-2">{condition.clinicalStatus.coding[0]?.code}</td>
                    <td className="px-4 py-2">{condition.recordedDate}</td>
                    <td className="px-4 py-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditConditionId(condition.id);
                          setConditionForm({
                            condition: condition.code.coding[0]?.display || '',
                            conditionCode: condition.code.coding[0]?.code || '',
                            codeSystem: condition.code.coding[0]?.system || 'http://hl7.org/fhir/sid/icd-10',
                            clinicalStatus: condition.clinicalStatus.coding[0]?.code || 'active',
                          });
                          setShowConditionModal(true);
                        }}
                      >
                        Edit
                      </Button>
                    </td>
                  </tr>
                )) || <tr><td colSpan={5}>No conditions found</td></tr>}
              </tbody>
            </table>
          </div>
          {showConditionModal && (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg max-w-md w-full">
                <h2 className="text-xl font-semibold mb-4">{editConditionId ? 'Edit' : 'Add'} Condition for {patient?.name || 'Unknown Patient'}</h2>
                <Input
                  placeholder="Condition (e.g., Asthma)"
                  value={conditionForm.condition}
                  onChange={(e) => setConditionForm({ ...conditionForm, condition: e.target.value })}
                  className="mb-2"
                />
                <Input
                  placeholder="ICD-10 Code (e.g., J45.909)"
                  value={conditionForm.conditionCode}
                  onChange={(e) => setConditionForm({ ...conditionForm, conditionCode: e.target.value })}
                  className="mb-4"
                />
                <div className="flex gap-2">
                  <Button onClick={handleConditionSubmit}>Save</Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowConditionModal(false);
                      setEditConditionId(null);
                      setConditionForm({
                        condition: '',
                        conditionCode: '',
                        codeSystem: 'http://hl7.org/fhir/sid/icd-10',
                        clinicalStatus: 'active',
                      });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClinicalOperationsPage;