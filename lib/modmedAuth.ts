import axios from 'axios';

const AUTH_ENDPOINT = `${process.env.MODMED_BASE_URL}/ema-dev/firm/${process.env.MODMED_FIRM_PREFIX}/ema/ws/oauth2/grant`;

let accessToken: string | null = null;
let tokenExpiry: number = 0;

export async function getAccessToken(): Promise<string> {
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
