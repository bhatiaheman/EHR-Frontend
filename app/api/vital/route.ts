import { cookies } from "next/headers";
import { NextRequest, NextResponse } from 'next/server';

const getConfig = () => {
  const firmPrefix = process.env.MODMED_FIRM_PREFIX;
  const apiKey = process.env.MODMED_API_KEY;
  if (!firmPrefix || !apiKey) {
    throw new Error('Missing firm prefix or API key');
  }
  const baseUrl = `https://stage.ema-api.com/ema-dev/firm/${firmPrefix}/ema/fhir/v2`;
  return { baseUrl, firmPrefix, apiKey };
};

const fhirFetch = async (url: string, options: RequestInit = {}) => {
  const accessToken = (await cookies()).get('modmed_access')?.value;
  if (!accessToken) throw new Error('No access token');
  const config = getConfig();
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'x-api-key': config.apiKey,
      'Content-Type': 'application/fhir+json',
      'Accept': 'application/fhir+json',
      ...options.headers,
    },
  });
  if (response.status === 401) throw new Error('Token expired');
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`FHIR API error: ${response.status} - ${error}`);
  }
  return response;
};


export async function GET(request: NextRequest, { params }: { params: { type: string } }) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patient');
    if (!patientId) throw new Error('Patient ID required');
    const config = getConfig();
    const url = `${config.baseUrl}/Observation?subject=Patient/${patientId}&category=vital-signs`;
    const response = await fhirFetch(url);
    const data = await response.json();
    const vitals = data.entry?.map((e: any) => e.resource) || [];
    return NextResponse.json(vitals);
  } catch (error: any) {
    console.error('Observation GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const patientId = request.nextUrl.searchParams.get('patient');
    if (!patientId) throw new Error('Patient ID required');
    const { code, value, unit, components } = await request.json(); // e.g., code: "Blood pressure", value: 120, unit: "mmHg"
    const config = getConfig();
    const url = `${config.baseUrl}/Observation`;
    const fhirObservation = {
      resourceType: 'Observation',
      status: 'final',
      category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'vital-signs' }] }],
      code: { coding: [{ system: 'http://loinc.org', code, display: code }] },
      subject: { reference: `Patient/${patientId}` },
      effectiveDateTime: new Date().toISOString(),
      valueQuantity: value ? { value, unit, system: 'http://unitsofmeasure.org', code: unit } : undefined,
      component: components ? components.map((comp: any) => ({
        code: { coding: [{ system: 'http://loinc.org', display: comp.code }] },
        valueQuantity: { value: comp.value, unit: comp.unit, system: 'http://unitsofmeasure.org', code: comp.unit },
      })) : undefined,
    };
    const response = await fhirFetch(url, { method: 'POST', body: JSON.stringify(fhirObservation) });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Observation POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) throw new Error('Observation ID required');
    const updatedData = await request.json();
    const config = getConfig();
    const url = `${config.baseUrl}/Observation/${id}`;
    const response = await fhirFetch(url, { method: 'PUT', body: JSON.stringify(updatedData) });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Observation PUT error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

