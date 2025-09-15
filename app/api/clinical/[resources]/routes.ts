import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { fhirConfig } from '../../../../lib/fhirConfig';
import { Patient } from '../../../../types/patient.types';

// Helper to calculate age from birthDate
const calculateAge = (birthDate: string): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};


const mapFhirToPatient = (fhirPatient: any): Patient => {
  const nameObj = fhirPatient.name?.[0] || { given: [''], family: '' };
  const telecom = fhirPatient.telecom || [];
  const phone = telecom.find((t: any) => t.system === 'phone')?.value || '';
  const email = telecom.find((t: any) => t.system === 'email')?.value || '';
  return {
    id: fhirPatient.id,
    name: `${nameObj.given?.[0] || ''} ${nameObj.family || ''}`.trim(),
    firstName: nameObj.given?.[0] || '',
    lastName: nameObj.family || '',
    age: fhirPatient.birthDate ? calculateAge(fhirPatient.birthDate) : 0,
    birthDate: fhirPatient.birthDate || '',
    gender: fhirPatient.gender || 'unknown',
    contact: phone || email || '',
    phone,
    email,
    conditions: [],
    allergies: [],
    medications: [],
    immunizations: [],
    lastVisit: '',
    status: 'Active',
    fhirMedications: [],
    fhirAllergies: [],
    fhirConditions: [],
  };
};


const mapPatientToFhir = (patient: Patient): any => ({
  resourceType: 'Patient',
  id: patient.id || undefined,
  name: [
    {
      given: [patient.firstName || ''],
      family: patient.lastName || '',
    },
  ],
  gender: patient.gender || 'unknown',
  telecom: [
    ...(patient.phone
      ? [
          {
            system: 'phone',
            value: patient.phone,
            use: 'mobile',
          },
        ]
      : []),
    ...(patient.email
      ? [
          {
            system: 'email',
            value: patient.email,
            use: 'home',
          },
        ]
      : []),
  ],
  birthDate: patient.birthDate || undefined,
});


async function refreshAccessToken() {
  const refreshToken = (await cookies()).get('modmed_refresh')?.value;
  if (!refreshToken) throw new Error('No refresh token available');

  const response = await fetch(`/api/modmed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'refresh' }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh token');
  }

  const { accessToken, refreshToken: newRefreshToken, expiresIn } = await response.json();
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: expiresIn,
  };

  (await cookies()).set('modmed_access', accessToken, cookieOptions);
  (await cookies()).set('modmed_refresh', newRefreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60,
  });

  return accessToken;
}

export async function GET(request: NextRequest) {
  try {
    const accessToken = (await cookies()).get('modmed_access')?.value;
    if (!accessToken) {
      return NextResponse.json({ error: 'No access token available' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    let response;
    if (id) {
      response = await fetch(`${fhirConfig.baseUrl}/Patient/${id}`, {
        headers: {
          ...fhirConfig.headers,
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } else {
      const name = searchParams.get('name');
      const query = name ? `?name=${encodeURIComponent(name)}` : '';
      response = await fetch(`${fhirConfig.baseUrl}/Patient${query}`, {
        headers: {
          ...fhirConfig.headers,
          Authorization: `Bearer ${accessToken}`,
        },
      });
    }

    if (response.status === 401) {
      try {
        const newAccessToken = await refreshAccessToken();
        response = await fetch(response.url, {
          headers: {
            ...fhirConfig.headers,
            Authorization: `Bearer ${newAccessToken}`,
          },
        });
      } catch (error) {
        return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
      }
    }

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.issue?.[0]?.diagnostics || 'Failed to fetch patients' },
        { status: response.status },
      );
    }

    if (id) {
      const fhirPatient = await response.json();
      return NextResponse.json(mapFhirToPatient(fhirPatient));
    }

    const bundle = await response.json();
    const patients = (bundle.entry || []).map((entry: any) => mapFhirToPatient(entry.resource));
    return NextResponse.json(patients);
  } catch (error: any) {
    console.error('Patient GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const accessToken = (await cookies()).get('modmed_access')?.value;
    if (!accessToken) {
      return NextResponse.json({ error: 'No access token available' }, { status: 401 });
    }

    const patient: Patient = await request.json();
    const fhirPatient = mapPatientToFhir(patient);

    let response = await fetch(`${fhirConfig.baseUrl}/Patient`, {
      method: 'POST',
      headers: {
        ...fhirConfig.headers,
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(fhirPatient),
    });

    if (response.status === 401) {
      try {
        const newAccessToken = await refreshAccessToken();
        response = await fetch(`${fhirConfig.baseUrl}/Patient`, {
          method: 'POST',
          headers: {
            ...fhirConfig.headers,
            Authorization: `Bearer ${newAccessToken}`,
          },
          body: JSON.stringify(fhirPatient),
        });
      } catch (error) {
        return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
      }
    }

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.issue?.[0]?.diagnostics || 'Failed to create patient' },
        { status: response.status },
      );
    }

    const createdPatient = await response.json();
    return NextResponse.json(mapFhirToPatient(createdPatient), { status: 201 });
  } catch (error: any) {
    console.error('Patient POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}