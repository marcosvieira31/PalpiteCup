export const fetchApiFootball = async (endpoint: string, options?: RequestInit) => {
  const apiKey = process.env.API_FOOTBALL_KEY;
  
  if (!apiKey) {
    throw new Error('API_FOOTBALL_KEY is not defined in environment variables.');
  }

  const url = `https://v3.football.api-sports.io${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'x-apisports-key': apiKey,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API-Football error: ${response.statusText}`);
  }

  return response.json();
};
