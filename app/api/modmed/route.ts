// app/api/auth/modmed/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

async function getAccessToken(username: string, password: string, apiKey: string, authUrl: string) {

  const response = await fetch(authUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'x-api-key': apiKey,
      'Host': 'stage.ema-api.com', 
    },
    body: new URLSearchParams({
      grant_type: 'password',
      username,
      password,
    }),
  });

  console.log('Auth response status:', response.status); 
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Auth failed: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in || 3600,
  };
}

async function refreshAccessToken(refreshToken: string, apiKey: string, authUrl: string) {
  const response = await fetch(authUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'x-api-key': apiKey,
      'Host': 'stage.ema-api.com',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    throw new Error(`Refresh failed: ${response.status}`);
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || refreshToken,
    expiresIn: data.expires_in || 3600,
  };
}

export async function POST(request: NextRequest) {
  try {
    const { username, password, action } = await request.json();
    const firmPrefix = process.env.MODMED_FIRM_PREFIX;
    const apiKey = process.env.MODMED_API_KEY;
    const authUrl = `https://stage.ema-api.com/ema-dev/firm/${firmPrefix}/ema/ws/oauth2/grant`;

    if (!firmPrefix || !apiKey) {
      throw new Error('Missing firm prefix or API key in server configuration');
    }

    let tokens;
    if (action === 'refresh') {
      const refreshToken = (await cookies()).get('modmed_refresh')?.value;
      if (!refreshToken) throw new Error('No refresh token available');
      tokens = await refreshAccessToken(refreshToken, apiKey, authUrl);
    } else {
      if (!username || !password) throw new Error('Missing username or password');
      tokens = await getAccessToken(username, password, apiKey, authUrl);
    }

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: tokens.expiresIn,
    };

    (await cookies()).set('modmed_access', tokens.accessToken, cookieOptions);
    (await cookies()).set('modmed_refresh', tokens.refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60, 
    });

    return NextResponse.json({ success: true, expiresIn: tokens.expiresIn });
  } catch (error: any) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: error.message.includes('Auth failed') ? 401 : 400 }
    );
  }
}