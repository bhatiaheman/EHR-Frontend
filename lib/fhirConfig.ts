export const fhirConfig = {
  baseUrl: process.env.MODMED_FHIR_URL || 'https://stage.ema-api.com/ema-dev/firm/entpmsandbox393/ema/fhir/v2',
  apiKey: process.env.MODMED_API_KEY || '',
  headers: {
    'Accept': 'application/fhir+json',
    'Content-Type': 'application/fhir+json',
    'X-API-Key': process.env.MODMED_API_KEY || '',
    'Host': 'stage.ema-api.com', 
  },
};