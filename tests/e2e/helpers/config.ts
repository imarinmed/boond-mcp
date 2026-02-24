export const E2E_CONFIG = {
  token: process.env.BOOND_TEST_TOKEN || '',
  apiUrl: process.env.BOOND_TEST_API_URL || 'https://ui.boondmanager.com/api/1.0',
  timeout: parseInt(process.env.BOOND_TEST_TIMEOUT || '30000', 10),
};

export function validateConfig(): void {
  if (!E2E_CONFIG.token) {
    throw new Error(
      'BOOND_TEST_TOKEN environment variable is required for E2E tests.\n' +
        'Please set it to a valid BoondManager API token:\n' +
        'export BOOND_TEST_TOKEN="your-api-token"'
    );
  }
}

export function getTestHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${E2E_CONFIG.token}`,
    'Content-Type': 'application/json',
    'X-Test-Run': 'true',
  };
}

export const TEST_TIMEOUTS = {
  short: 5000,
  medium: 15000,
  long: 30000,
  extended: 60000,
};
