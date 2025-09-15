import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

interface FhirPatient {
  resourceType: 'Patient';
  id?: string;
  name: { given: string[]; family: string }[];
  gender: string;
  birthDate: string;
  telecom?: { system: string; value: string; use?: string }[];
  active: boolean;
}

const API_URL = `${process.env.MODMED_BASE_URL}/ema-dev/firm/${process.env.MODMED_FIRM_PREFIX}/ema/fhir/v2/Patient`;
const AUTH_ENDPOINT = `${process.env.MODMED_BASE_URL}/ema-dev/firm/${process.env.MODMED_FIRM_PREFIX}/ema/ws/oauth2/grant`;

let accessToken: string | null = null;
let tokenExpiry: number = 0;

async function getAccessToken(): Promise<string> {
  if (accessToken && Date.now() < tokenExpiry) return accessToken;

  try {
    if (!process.env.MODMED_USERNAME || !process.env.MODMED_PASSWORD || !process.env.MODMED_API_KEY) {
      throw new Error('Missing required environment variables for authentication');
    }

    const response = await axios.post(
      AUTH_ENDPOINT,
      new URLSearchParams({
        grant_type: 'password',
        username: process.env.MODMED_USERNAME,
        password: process.env.MODMED_PASSWORD,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'x-api-key': process.env.MODMED_API_KEY,
        },
      }
    );

    accessToken = response.data.access_token;
    tokenExpiry = Date.now() + response.data.expires_in * 1000 - 60000; 
    if (!accessToken) {
      throw new Error('Failed to obtain access token');
    }
    return accessToken;
  } catch (error: any) {
    console.error('Token fetch error:', error.response?.data || error.message);
    throw new Error(`Authentication failed: ${error.response?.data?.error || error.message}`);
  }
}

async function makeApiRequest(method: string, body?: any, accessToken?: string, retryCount = 0): Promise<{ status: number; data: any }> {
  if (!process.env.MODMED_API_KEY) {
    throw new Error('Missing API key in environment variables');
  }

  const headers = {
    accept: 'application/fhir+json',
    authorization: `Bearer ${accessToken}`,
    'x-api-key': process.env.MODMED_API_KEY,
    'content-type': 'application/fhir+json',
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); 
    const response = await fetch(API_URL, {
      method,
      headers,
      ...(body && { body: JSON.stringify(body) }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type');
    if (!response.ok) {
      let errorDetails: any = { status: response.status, statusText: response.statusText };
      const responseText = await response.text();

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
        return makeApiRequest(method, body, accessToken, retryCount + 1);
      }

      throw new Error(JSON.stringify(errorDetails));
    }

    if (response.status === 204 || !contentType?.includes('json')) {
      console.log('Empty or non-JSON response received');
      return { status: response.status, data: null };
    }

    const data = await response.json();
    console.log('ModMed API Success Response:', data);
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
    const accessToken = await getAccessToken();
    const response = await makeApiRequest('GET', undefined, accessToken);
    const data = response.data || {};

    const patients = data.entry?.map((entry: { resource: any }) => {
      const resource = entry.resource;
      return {
        id: resource.id,
        name: resource.name?.[0]?.family
          ? `${resource.name[0].given?.join(' ') || ''} ${resource.name[0].family}`.trim()
          : 'Unknown',
        age: resource.birthDate
          ? Math.floor(
              (new Date().getTime() - new Date(resource.birthDate).getTime()) /
                (1000 * 60 * 60 * 24 * 365.25)
            )
          : null,
        gender: resource.gender || 'unknown',
        contact:
          resource.telecom?.find((t: { system: string }) => t.system === 'phone')?.value ||
          resource.telecom?.find((t: { system: string }) => t.system === 'email')?.value ||
          'N/A',
        status: resource.active ? 'Active' : 'Inactive',
      };
    }) || [];

    return NextResponse.json(patients);
  } catch (error: any) {
    console.error('Error fetching patients:', error.message);
    const errorDetails = error.message.startsWith('{') ? JSON.parse(error.message) : { details: error.message };
    return NextResponse.json(
      { error: 'Failed to fetch patients', details: errorDetails },
      { status: errorDetails.status || 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const accessToken = await getAccessToken();
    const body = await request.json();


    if (!body.firstName || !body.lastName || !body.gender || !body.birthDate) {
      throw new Error('Missing required fields: firstName, lastName, gender, birthDate');
    }

    const fhirPatient = {
      resourceType: 'Patient',
      name: [
        {
          given: [body.firstName],
          family: body.lastName,
        },
      ],
      gender: body.gender.toLowerCase(), 
      birthDate: body.birthDate, 
      telecom: [
        body.phone && {
          system: 'phone',
          value: body.phone,
          use: 'mobile',
        },
        body.email && {
          system: 'email',
          value: body.email,
        },
      ].filter(Boolean),
      active: body.status === 'Active',
    };

    const response = await makeApiRequest('POST', fhirPatient, accessToken);
    return NextResponse.json(response.data || { message: 'Patient created' }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating patient:', error.message);
    const errorDetails = error.message.startsWith('{') ? JSON.parse(error.message) : { details: error.message };
    return NextResponse.json(
      { error: 'Failed to create patient', details: errorDetails },
      { status: errorDetails.status || 500 }
    );
  }
}

// export async function PUT(request: NextRequest) {
//   try {
//     const accessToken = await getAccessToken();
//     const body = await request.json();

//     if (!body.id || !body.firstName || !body.lastName || !body.gender || !body.birthDate) {
//       throw new Error('Missing required fields: id, firstName, lastName, gender, birthDate');
//     }

//     const fhirPatient: FhirPatient = {
//       resourceType: 'Patient',
//       id: body.id,
//       name: [
//         {
//           given: [body.firstName],
//           family: body.lastName,
//         },
//       ],
//       gender: body.gender.toLowerCase(),
//       birthDate: body.birthDate,
//       telecom: [
//         body.phone && {
//           system: 'phone',
//           value: body.phone,
//           use: 'mobile',
//         },
//         body.email && {
//           system: 'email',
//           value: body.email,
//         },
//       ].filter((item): item is NonNullable<typeof item> => Boolean(item)),
//       active: body.status === 'Active',
//     };

//     console.log('FHIR Payload Sent to ModMed (PUT):', JSON.stringify(fhirPatient, null, 2));

//     const response = await makeApiRequest('PUT', fhirPatient, `${API_URL}/${body.id}`, accessToken);
//     return NextResponse.json(response.data || { message: 'Patient updated', id: body.id }, { status: 200 });
//   } catch (error: any) {
//     console.error('Error updating patient:', error.message);
//     const errorDetails = error.message.startsWith('{') ? JSON.parse(error.message) : { details: error.message };
//     return NextResponse.json(
//       { error: 'Failed to update patient', details: errorDetails },
//       { status: errorDetails.status || 500 }
//     );
//   }
// }