import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/modmedAuth';


interface FhirCondition {
  resourceType: 'Condition';
  id?: string;
  clinicalStatus?: { coding: { system?: string; code: string; display?: string }[] };
  code?: { coding: { system?: string; code?: string; display?: string }[] };
  subject: { reference: string };
  onsetDateTime?: string;
}

const API_URL = `${process.env.MODMED_BASE_URL}/ema-dev/firm/${process.env.MODMED_FIRM_PREFIX}/ema/fhir/v2/Condition`;

async function makeApiRequest(method: string, url: string, body?: FhirCondition, accessToken?: string, retryCount = 0): Promise<{ status: number; data: any }> {

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
                resourceType: 'Condition',
                id: 'mock-cond-123',
                clinicalStatus: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-clinical', code: 'active' }] },
                code: { coding: [{ system: 'http://snomed.info/sct', code: '12345', display: 'Hypertension' }] },
                subject: { reference: 'Patient/mock-123' },
                onsetDateTime: '2025-01-01',
              },
            },
          ],
        },
      };
    } else if (method === 'POST' || method === 'PUT') {
      return {
        status: method === 'POST' ? 201 : 200,
        data: { ...body, id: body?.id || `mock-cond-${Date.now()}` },
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

    const conditions = id
      ? [data].filter(Boolean).map((resource: any) => ({
          id: resource.id || 'N/A',
          condition: resource.code?.coding?.[0]?.display || 'Unknown',
          status: resource.clinicalStatus?.coding?.[0]?.code || 'unknown',
          patientId: resource.subject?.reference?.replace('Patient/', '') || 'N/A',
          onsetDate: resource.onsetDateTime || '',
        }))
      : data.entry?.map((entry: { resource: any }) => {
          const resource = entry.resource;
          return {
            id: resource.id || 'N/A',
            condition: resource.code?.coding?.[0]?.display || 'Unknown',
            status: resource.clinicalStatus?.coding?.[0]?.code || 'unknown',
            patientId: resource.subject?.reference?.replace('Patient/', '') || 'N/A',
            onsetDate: resource.onsetDateTime || '',
          };
        }) || [];

    return NextResponse.json(conditions);
  } catch (error: any) {
    console.error('Error fetching conditions:', error.message);
    const errorDetails = error.message.startsWith('{') ? JSON.parse(error.message) : { details: error.message };
    return NextResponse.json(
      { error: 'Failed to fetch conditions', details: errorDetails },
      { status: errorDetails.status || 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const accessToken = await getAccessToken();
    const body = await request.json();

    if (!body.condition || !body.patientId) {
      throw new Error('Missing required fields: condition, patientId');
    }

    const fhirCondition: FhirCondition = {
      resourceType: 'Condition',
      clinicalStatus: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-clinical', code: body.status || 'active' }] },
      code: { coding: [{ system: 'http://snomed.info/sct', code: body.conditionCode || '12345', display: body.condition }] },
      subject: { reference: `Patient/${body.patientId}` },
      onsetDateTime: body.onsetDate || new Date().toISOString().split('T')[0],
    };

    console.log('FHIR Payload Sent to ModMed (POST):', JSON.stringify(fhirCondition, null, 2));

    const response = await makeApiRequest('POST', API_URL, fhirCondition, accessToken);
    return NextResponse.json(response.data || { message: 'Condition created', id: response.data?.id }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating condition:', error.message);
    const errorDetails = error.message.startsWith('{') ? JSON.parse(error.message) : { details: error.message };
    return NextResponse.json(
      { error: 'Failed to create condition', details: errorDetails },
      { status: errorDetails.status || 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const accessToken = await getAccessToken();
    const body = await request.json();

    if (!body.id || !body.condition || !body.patientId) {
      throw new Error('Missing required fields: id, condition, patientId');
    }

    const fhirCondition: FhirCondition = {
      resourceType: 'Condition',
      id: body.id,
      clinicalStatus: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-clinical', code: body.status || 'active' }] },
      code: { coding: [{ system: 'http://snomed.info/sct', code: body.conditionCode || '12345', display: body.condition }] },
      subject: { reference: `Patient/${body.patientId}` },
      onsetDateTime: body.onsetDate || new Date().toISOString().split('T')[0],
    };

    console.log('FHIR Payload Sent to ModMed (PUT):', JSON.stringify(fhirCondition, null, 2));

    const response = await makeApiRequest('PUT', `${API_URL}/${body.id}`, fhirCondition, accessToken);
    return NextResponse.json(response.data || { message: 'Condition updated', id: body.id }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating condition:', error.message);
    const errorDetails = error.message.startsWith('{') ? JSON.parse(error.message) : { details: error.message };
    return NextResponse.json(
      { error: 'Failed to update condition', details: errorDetails },
      { status: errorDetails.status || 500 }
    );
  }
}
