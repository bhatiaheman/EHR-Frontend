
import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/modmedAuth';

interface FhirMedicationStatement {
  resourceType: 'MedicationStatement';
  id?: string;
  status: 'active' | 'completed' | 'entered-in-error' | 'intended' | 'stopped' | 'on-hold' | 'unknown';
  medicationCodeableConcept?: { coding: { system?: string; code?: string; display?: string }[] };
  subject: { reference: string };
  effectiveDateTime?: string;
  dosage?: { text?: string; doseQuantity?: { value: number; unit: string } }[];
}

const API_URL = `${process.env.MODMED_BASE_URL}/ema-dev/firm/${process.env.MODMED_FIRM_PREFIX}/ema/fhir/v2/MedicationStatement`;

async function makeApiRequest(method: string, url: string, body?: FhirMedicationStatement, accessToken?: string, retryCount = 0): Promise<{ status: number; data: any }> {

  if (!process.env.MODMED_API_KEY || process.env.NODE_ENV === 'development') {
    console.log(`Mocking ${method} request to ${url}`);
    if (method === 'GET') {
      return {
        status: 200,
        data: {
          resourceType: 'Bundle',
          total: 1,
          entry: [
            {
              resource: {
                resourceType: 'MedicationStatement',
                id: 'mock-med-123',
                status: 'active',
                medicationCodeableConcept: { coding: [{ system: 'http://snomed.info/sct', code: '12345', display: 'Aspirin' }] },
                subject: { reference: 'Patient/mock-123' },
                effectiveDateTime: '2025-01-01',
                dosage: [{ text: '1 tablet daily', doseQuantity: { value: 1, unit: 'tablet' } }],
              },
            },
          ],
        },
      };
    } else if (method === 'POST' || method === 'PUT') {
      return {
        status: method === 'POST' ? 201 : 200,
        data: { ...body, id: body?.id || `mock-med-${Date.now()}` },
      };
    }
  }

  const token = accessToken || (await getAccessToken());
  const headers = {
    accept: 'application/fhir+json',
    authorization: `Bearer ${token}`,
    'x-api-key': process.env.MODMED_API_KEY!,
    'content-type': 'application/fhir+json',
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    console.log(`ModMed API Request: ${method} ${url}`);
    console.log(`ModMed API Response Status: ${response.status} ${response.statusText}`);
    console.log(`ModMed API Response Headers:`, Object.fromEntries(response.headers.entries()));

    const contentType = response.headers.get('content-type');
    if (!response.ok) {
      let errorDetails: any = { status: response.status, statusText: response.statusText };
      const responseText = await response.text();
      console.log('Raw Response Body:', responseText || 'Empty response');
      if (contentType?.includes('application/json') || contentType?.includes('application/fhir+json')) {
        try {
          const errorData = JSON.parse(responseText);
          errorDetails = { ...errorDetails, ...errorData };
          console.log('Parsed Error Response:', errorData);
        } catch (e) {
          console.warn('Failed to parse error response as JSON:', e);
          errorDetails.rawText = responseText || 'Empty response';
        }
      } else {
        errorDetails.rawText = responseText || 'Empty response';
      }

      if ((response.status === 429 || response.status === 503) && retryCount < 3) {
        console.log(`Retrying request (attempt ${retryCount + 2})...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return makeApiRequest(method, url, body, token, retryCount + 1);
      }

      throw new Error(JSON.stringify(errorDetails));
    }

    if (response.status === 204 || !contentType?.includes('json')) {
      return { status: response.status, data: null };
    }

    const data = await response.json();
    console.log('ModMed API Success Response:', JSON.stringify(data, null, 2));
    return { status: response.status, data };
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out after 10 seconds');
    }
    console.error('API request error:', error.message);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const patient = searchParams.get('patient');
    const _count = searchParams.get('_count') || '100';
    const page = searchParams.get('page') || '1';
    let url = API_URL;

    if (id) {
      url = `${API_URL}/${id}`;
    } else if (patient) {
      url = `${API_URL}?patient=${patient}&_count=${_count}&page=${page}`;
    } else {
      url = `${API_URL}?_count=${_count}&page=${page}`;
    }

    const accessToken = await getAccessToken();
    const response = await makeApiRequest('GET', url, undefined, accessToken);
    const data = response.data || {};

    const medications = id
      ? [data].filter(Boolean).map((resource: any) => ({
          id: resource.id || 'N/A',
          medication: resource.medicationCodeableConcept?.coding?.[0]?.display || 'Unknown',
          status: resource.status || 'unknown',
          patientId: resource.subject?.reference?.replace('Patient/', '') || 'N/A',
          effectiveDate: resource.effectiveDateTime || '',
          dosage: resource.dosage?.[0]?.text || 'N/A',
        }))
      : data.entry?.map((entry: { resource: any }) => {
          const resource = entry.resource;
          return {
            id: resource.id || 'N/A',
            medication: resource.medicationCodeableConcept?.coding?.[0]?.display || 'Unknown',
            status: resource.status || 'unknown',
            patientId: resource.subject?.reference?.replace('Patient/', '') || 'N/A',
            effectiveDate: resource.effectiveDateTime || '',
            dosage: resource.dosage?.[0]?.text || 'N/A',
          };
        }) || [];

    return NextResponse.json(medications);
  } catch (error: any) {
    console.error('Error fetching medications:', error.message);
    const errorDetails = error.message.startsWith('{') ? JSON.parse(error.message) : { details: error.message };
    return NextResponse.json(
      { error: 'Failed to fetch medications', details: errorDetails },
      { status: errorDetails.status || 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const accessToken = await getAccessToken();
    const body = await request.json();

    if (!body.medication || !body.status || !body.patientId) {
      throw new Error('Missing required fields: medication, status, patientId');
    }

    const fhirMedicationStatement: FhirMedicationStatement = {
      resourceType: 'MedicationStatement',
      status: body.status,
      medicationCodeableConcept: {
        coding: [{ system: 'http://snomed.info/sct', code: body.medicationCode || '12345', display: body.medication }],
      },
      subject: { reference: `Patient/${body.patientId}` },
      effectiveDateTime: body.effectiveDate || new Date().toISOString().split('T')[0],
      dosage: body.dosage ? [{ text: body.dosage, doseQuantity: { value: body.doseValue || 1, unit: body.doseUnit || 'tablet' } }] : undefined,
    };

    console.log('FHIR Payload Sent to ModMed (POST):', JSON.stringify(fhirMedicationStatement, null, 2));

    const response = await makeApiRequest('POST', API_URL, fhirMedicationStatement, accessToken);
    return NextResponse.json(response.data || { message: 'Medication created', id: response.data?.id }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating medication:', error.message);
    const errorDetails = error.message.startsWith('{') ? JSON.parse(error.message) : { details: error.message };
    return NextResponse.json(
      { error: 'Failed to create medication', details: errorDetails },
      { status: errorDetails.status || 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const accessToken = await getAccessToken();
    const body = await request.json();

    if (!body.id || !body.medication || !body.status || !body.patientId) {
      throw new Error('Missing required fields: id, medication, status, patientId');
    }

    const fhirMedicationStatement: FhirMedicationStatement = {
      resourceType: 'MedicationStatement',
      id: body.id,
      status: body.status,
      medicationCodeableConcept: {
        coding: [{ system: 'http://snomed.info/sct', code: body.medicationCode || '12345', display: body.medication }],
      },
      subject: { reference: `Patient/${body.patientId}` },
      effectiveDateTime: body.effectiveDate || new Date().toISOString().split('T')[0],
      dosage: body.dosage ? [{ text: body.dosage, doseQuantity: { value: body.doseValue || 1, unit: body.doseUnit || 'tablet' } }] : undefined,
    };



    const response = await makeApiRequest('PUT', `${API_URL}/${body.id}`, fhirMedicationStatement, accessToken);
    return NextResponse.json(response.data || { message: 'Medication updated', id: body.id }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating medication:', error.message);
    const errorDetails = error.message.startsWith('{') ? JSON.parse(error.message) : { details: error.message };
    return NextResponse.json(
      { error: 'Failed to update medication', details: errorDetails },
      { status: errorDetails.status || 500 }
    );
  }
}
