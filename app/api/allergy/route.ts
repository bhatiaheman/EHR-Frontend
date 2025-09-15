
import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/modmedAuth';

interface FhirAllergyIntolerance {
  resourceType: 'AllergyIntolerance';
  id?: string;
  clinicalStatus?: { coding: { system?: string; code: string; display?: string }[] };
  code?: { coding: { system?: string; code?: string; display?: string }[] };
  patient: { reference: string };
  recordedDate?: string;
}

const API_URL = `${process.env.MODMED_BASE_URL}/ema-dev/firm/${process.env.MODMED_FIRM_PREFIX}/ema/fhir/v2/AllergyIntolerance`;

async function makeApiRequest(method: string, url: string, body?: FhirAllergyIntolerance, accessToken?: string, retryCount = 0): Promise<{ status: number; data: any }> {
  // Mock response for development
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
                resourceType: 'AllergyIntolerance',
                id: 'mock-allergy-123',
                clinicalStatus: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical', code: 'active' }] },
                code: { coding: [{ system: 'http://snomed.info/sct', code: '12345', display: 'Peanut Allergy' }] },
                patient: { reference: 'Patient/mock-123' },
                recordedDate: '2025-01-01',
              },
            },
          ],
        },
      };
    } else if (method === 'POST' || method === 'PUT') {
      return {
        status: method === 'POST' ? 201 : 200,
        data: { ...body, id: body?.id || `mock-allergy-${Date.now()}` },
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
    let url = API_URL;

    if (id) {
      url = `${API_URL}/${id}`;
    } else if (patient) {
      url = `${API_URL}?patient=${patient}`;
    }

    const accessToken = await getAccessToken();
    const response = await makeApiRequest('GET', url, undefined, accessToken);
    const data = response.data || {};

    const allergies = id
      ? [data].filter(Boolean).map((resource: any) => ({
          id: resource.id || 'N/A',
          allergen: resource.code?.coding?.[0]?.display || 'Unknown',
          status: resource.clinicalStatus?.coding?.[0]?.code || 'unknown',
          patientId: resource.patient?.reference?.replace('Patient/', '') || 'N/A',
          recordedDate: resource.recordedDate || '',
        }))
      : data.entry?.map((entry: { resource: any }) => {
          const resource = entry.resource;
          return {
            id: resource.id || 'N/A',
            allergen: resource.code?.coding?.[0]?.display || 'Unknown',
            status: resource.clinicalStatus?.coding?.[0]?.code || 'unknown',
            patientId: resource.patient?.reference?.replace('Patient/', '') || 'N/A',
            recordedDate: resource.recordedDate || '',
          };
        }) || [];

    return NextResponse.json(allergies);
  } catch (error: any) {
    console.error('Error fetching allergies:', error.message);
    const errorDetails = error.message.startsWith('{') ? JSON.parse(error.message) : { details: error.message };
    return NextResponse.json(
      { error: 'Failed to fetch allergies', details: errorDetails },
      { status: errorDetails.status || 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const accessToken = await getAccessToken();
    const body = await request.json();

    if (!body.allergen || !body.patientId) {
      throw new Error('Missing required fields: allergen, patientId');
    }

    const fhirAllergy: FhirAllergyIntolerance = {
      resourceType: 'AllergyIntolerance',
      clinicalStatus: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical', code: body.status || 'active' }] },
      code: { coding: [{ system: 'http://snomed.info/sct', code: body.allergenCode || '12345', display: body.allergen }] },
      patient: { reference: `Patient/${body.patientId}` },
      recordedDate: body.recordedDate || new Date().toISOString().split('T')[0],
    };

    console.log('FHIR Payload Sent to ModMed (POST):', JSON.stringify(fhirAllergy, null, 2));

    const response = await makeApiRequest('POST', API_URL, fhirAllergy, accessToken);
    return NextResponse.json(response.data || { message: 'Allergy created', id: response.data?.id }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating allergy:', error.message);
    const errorDetails = error.message.startsWith('{') ? JSON.parse(error.message) : { details: error.message };
    return NextResponse.json(
      { error: 'Failed to create allergy', details: errorDetails },
      { status: errorDetails.status || 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const accessToken = await getAccessToken();
    const body = await request.json();

    if (!body.id || !body.allergen || !body.patientId) {
      throw new Error('Missing required fields: id, allergen, patientId');
    }

    const fhirAllergy: FhirAllergyIntolerance = {
      resourceType: 'AllergyIntolerance',
      id: body.id,
      clinicalStatus: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical', code: body.status || 'active' }] },
      code: { coding: [{ system: 'http://snomed.info/sct', code: body.allergenCode || '12345', display: body.allergen }] },
      patient: { reference: `Patient/${body.patientId}` },
      recordedDate: body.recordedDate || new Date().toISOString().split('T')[0],
    };

    console.log('FHIR Payload Sent to ModMed (PUT):', JSON.stringify(fhirAllergy, null, 2));

    const response = await makeApiRequest('PUT', `${API_URL}/${body.id}`, fhirAllergy, accessToken);
    return NextResponse.json(response.data || { message: 'Allergy updated', id: body.id }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating allergy:', error.message);
    const errorDetails = error.message.startsWith('{') ? JSON.parse(error.message) : { details: error.message };
    return NextResponse.json(
      { error: 'Failed to update allergy', details: errorDetails },
      { status: errorDetails.status || 500 }
    );
  }
}
