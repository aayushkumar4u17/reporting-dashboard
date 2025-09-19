// Environment validation for production readiness
export interface EnvConfig {
  VITE_FIREBASE_API_KEY: string;
  VITE_FIREBASE_AUTH_DOMAIN: string;
  VITE_FIREBASE_PROJECT_ID: string;
  VITE_API_BASE_URL: string;
  VITE_GRAPHQL_ENDPOINT: string;
  VITE_APP_ENVIRONMENT: string;
}

const requiredEnvVars: (keyof EnvConfig)[] = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_API_BASE_URL',
  'VITE_GRAPHQL_ENDPOINT',
  'VITE_APP_ENVIRONMENT'
];

export const validateEnvironment = (): EnvConfig => {
  const missingVars: string[] = [];
  const config: Partial<EnvConfig> = {};

  for (const varName of requiredEnvVars) {
    const value = import.meta.env[varName];
    if (!value) {
      missingVars.push(varName);
    } else {
      config[varName] = value;
    }
  }

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  // Validate URLs
  const urlVars = ['VITE_API_BASE_URL', 'VITE_GRAPHQL_ENDPOINT'];
  for (const urlVar of urlVars) {
    const url = config[urlVar as keyof EnvConfig];
    if (url && !isValidUrl(url)) {
      throw new Error(`Invalid URL format for ${urlVar}: ${url}`);
    }
  }

  return config as EnvConfig;
};

const isValidUrl = (string: string): boolean => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

export const getEnvironmentInfo = () => {
  const config = validateEnvironment();
  return {
    environment: config.VITE_APP_ENVIRONMENT,
    isProduction: config.VITE_APP_ENVIRONMENT === 'production',
    isDevelopment: import.meta.env.MODE === 'development',
    apiBaseUrl: config.VITE_API_BASE_URL,
    graphqlEndpoint: config.VITE_GRAPHQL_ENDPOINT
  };
};