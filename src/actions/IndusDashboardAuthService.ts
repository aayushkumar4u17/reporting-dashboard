/**
 * Indus Dashboard Authentication Service
 * Handles validation of users against organisation_user table for dashboard access
 * Uses JWT authentication instead of admin secrets for security
 */

import client from './GraphQLClient';
import { checkHasuraUserId } from './general';
import { getAuth } from 'firebase/auth';
import axios from 'axios';

// Determine if we're in development mode
const isDevelopment = typeof process !== 'undefined' && process.env.NODE_ENV === 'development';

// TypeScript interfaces for the validation response
export interface OrganizationUser {
  id: string;
  user_id: string;
  is_active: boolean;
  is_owner: boolean;
  organization_id: string;
  organization: {
    id: string;
    name?: string;
    is_active: boolean;
    created_at?: string;
  };
  user: {
    id: string;
    first_name?: string;
    last_name?: string;
    phone_number?: string;
    email?: string;
    created_at?: string;
  };
  created_at?: string;
}

export interface ValidationResponse {
  organization_user: OrganizationUser[];
}

export interface ValidationResult {
  success: boolean;
  error?: string;
  errorCode?: 'USER_NOT_FOUND' | 'USER_INACTIVE' | 'NOT_OWNER' | 'ORGANIZATION_INACTIVE' | 'NETWORK_ERROR' | 'AUTH_ERROR';
  data?: OrganizationUser;
}

/**
 * Get token with Hasura claims
 * @returns Promise<string | null> - Returns token with claims or null
 */
const getTokenWithClaims = async (): Promise<string | null> => {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) return null;
  
  let token: string | null = null;
  
  for (let i = 0; i < 5; i++) {
    try {
      token = await user.getIdToken(true);
      const decodedToken = await user.getIdTokenResult();
      if (decodedToken.claims['https://hasura.io/jwt/claims']) {
        return token;
      }
    } catch (error) {
      await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
    }
  }
  
  return null;
};

/**
 * Refresh token with retry mechanism
 * @param uid - Firebase user ID
 * @param maxAttempts - Maximum number of retry attempts
 * @returns Promise<boolean> - Returns true if refresh was successful
 */
const refreshTokenWithRetry = async (uid: string, maxAttempts: number = 3): Promise<boolean> => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // Use proxy in development to avoid CORS issues
      const url = isDevelopment 
        ? `/api/refreshToken?uid=${uid}`
        : `https://us-central1-fuelbuddy-india.cloudfunctions.net/refreshToken?uid=${uid}`;
      
      const response = await axios.get(url, {
        timeout: 10000, // 10 second timeout
      });
      
      if (response.status === 200) {
        return true;
      }
    } catch (error) {
      // If it's the last attempt, don't wait
      if (attempt < maxAttempts) {
        // Exponential backoff: 2s, 4s, 6s
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
      }
    }
  }
  
  return false;
};

/**
 * Wait for Firebase token to get Hasura claims
 * @param userId - Firebase user ID
 * @param maxAttempts - Maximum number of attempts
 * @returns Promise<string | null> - Returns Hasura user ID or null
 */
const waitForHasuraClaims = async (userId: string, maxAttempts: number = 5): Promise<string | null> => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // Check if user has Hasura claims now
      const hasuraUserId = await checkHasuraUserId();
      
      if (hasuraUserId && typeof hasuraUserId === 'string') {
        return hasuraUserId;
      }
      
      // If no claims and it's not the last attempt, try to refresh token
      if (attempt < maxAttempts) {
        try {
          // Call the refresh token function with retry mechanism
          const refreshed = await refreshTokenWithRetry(userId, 3);
          
          if (!refreshed) {
            // Still wait a bit in case the token gets refreshed by other means
            await new Promise(resolve => setTimeout(resolve, 2000));
            continue;
          }
          
          // Wait a bit for the claims to propagate
          const waitTime = Math.min(2000 + (attempt * 1000), 5000); // Progressive wait: 3s, 4s, 5s, 5s, 5s
          await new Promise(resolve => setTimeout(resolve, waitTime));
          
          // Force refresh the token locally
          const auth = getAuth();
          const user = auth.currentUser;
          if (user) {
            await user.getIdToken(true); // Force refresh
          }
          
        } catch (refreshError) {
          // Still wait a bit in case the token gets refreshed by other means
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
    } catch (error) {
      // Don't give up immediately on error, wait and try again
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  
  return null;
};

// GraphQL query for fetching user organizations (for organization selection) - ONLY ACTIVE OWNERS
const FETCH_USER_ORGANIZATIONS_QUERY = `
  query fetchUserOrganizations($user_id: uuid!) {
    organization_user(
      where: {
        user_id: { _eq: $user_id }
        is_active: { _eq: true }
        is_owner: { _eq: true }
      }
    ) {
      id
      user_id
      is_active
      is_owner
      organization_id
      organization {
        id
        name
        is_active
        created_at
      }
      user {
        id
        first_name
        last_name
        phone_number
        email
        created_at
      }
      created_at
    }
  }
`;

// GraphQL query for validating Indus Dashboard user
const VALIDATE_INDUS_DASHBOARD_USER_QUERY = `
  query validateIndusDashboardUser($user_id: uuid!) {
    organization_user(
      where: {
        user_id: { _eq: $user_id }
        is_active: { _eq: true }
        is_owner: { _eq: true }
      }
    ) {
      id
      user_id
      is_active
      is_owner
      organization_id
      organization {
        id
        name
        is_active
        created_at
      }
      user {
        id
        first_name
        last_name
        phone_number
        email
        created_at
      }
      created_at
    }
  }
`;

/**
 * Validates if a user has access to the Indus Dashboard
 * @param userId - Firebase/Hasura user ID
 * @returns ValidationResult with success status and error details
 */
export const validateIndusDashboardUser = async (userId: string): Promise<ValidationResult> => {
  try {
    // Step 1: Check if user currently has Hasura claims
    let hasuraUserId = await checkHasuraUserId();
    let hasuraUserIdString: string | null = null;
    
    if (hasuraUserId && typeof hasuraUserId === 'string') {
      hasuraUserIdString = hasuraUserId;
    }
    
    // Step 2: If no claims, wait for them to be added
    if (!hasuraUserIdString) {
      hasuraUserIdString = await waitForHasuraClaims(userId);
      
      if (!hasuraUserIdString) {
        return {
          success: false,
          error: 'Account permissions are being configured. Please try again in a few moments.',
          errorCode: 'AUTH_ERROR'
        };
      }
    }

    // Step 3: Use JWT-authenticated GraphQL client for user validation
    try {
      const graphqlClient = await client;
      
      const result: ValidationResponse = await graphqlClient.request(
        VALIDATE_INDUS_DASHBOARD_USER_QUERY,
        { user_id: hasuraUserIdString },
        hasuraUserIdString // Pass userId for session variables
      );

      // Check if user exists in organization_user table
      const organizationUsers = result.organization_user;
      
      if (!organizationUsers || organizationUsers.length === 0) {
        return {
          success: false,
          error: 'Access denied. You are not authorized to access the Indus Dashboard. Please contact your administrator.',
          errorCode: 'USER_NOT_FOUND'
        };
      }

      // Handle case where there are multiple organization user entries
      // Get the first active organization user record
      let organizationUser = organizationUsers[0];
      
      // Prefer an active owner record if available
      const activeOwner = organizationUsers.find(
        user => user.is_active && user.is_owner
      );
      
      if (activeOwner) {
        organizationUser = activeOwner;
      }

      // Validate user is active
      if (!organizationUser.is_active) {
        return {
          success: false,
          error: 'Your account has been deactivated. Please contact your administrator.',
          errorCode: 'USER_INACTIVE'
        };
      }

      // Validate user is owner
      if (!organizationUser.is_owner) {
        return {
          success: false,
          error: 'You do not have owner privileges for the Indus Dashboard. Please contact your administrator.',
          errorCode: 'NOT_OWNER'
        };
      }

      // Validate organization is active
      if (!organizationUser.organization.is_active) {
        return {
          success: false,
          error: 'Your organization account is inactive. Please contact support.',
          errorCode: 'ORGANIZATION_INACTIVE'
        };
      }

      return {
        success: true,
        data: organizationUser
      };
      
    } catch (graphqlError) {
      // Check for JWT authentication errors
      if (graphqlError?.response?.errors?.[0]?.extensions?.code === 'invalid-jwt') {
        return {
          success: false,
          error: 'Your session has expired. Please log in again.',
          errorCode: 'AUTH_ERROR'
        };
      }
      
      // Check for JWT claims errors
      if (graphqlError?.response?.errors?.[0]?.extensions?.code === 'jwt-invalid-claims') {
        return {
          success: false,
          error: 'Authentication error. Please try logging in again.',
          errorCode: 'AUTH_ERROR'
        };
      }
      
      // Check for permission errors
      if (graphqlError?.response?.errors?.[0]?.message?.includes('permission')) {
        return {
          success: false,
          error: 'You do not have permission to access this resource.',
          errorCode: 'USER_NOT_FOUND'
        };
      }
      
      // Generic GraphQL error
      return {
        success: false,
        error: 'Unable to validate your access. Please try again.',
        errorCode: 'NETWORK_ERROR'
      };
    }

  } catch (error) {
    // Handle GraphQL errors
    if (error?.response?.errors) {
      return {
        success: false,
        error: 'Unable to validate your access. Please try again later.',
        errorCode: 'NETWORK_ERROR'
      };
    }

    // Handle network errors
    if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('fetch')) {
      return {
        success: false,
        error: 'Network error. Please check your connection and try again.',
        errorCode: 'NETWORK_ERROR'
      };
    }

    // Generic error
    return {
      success: false,
      error: 'An unexpected error occurred during validation. Please try again.',
      errorCode: 'NETWORK_ERROR'
    };
  }
};

/**
 * Helper function to get user's organization details after successful validation
 * @param userId - Firebase/Hasura user ID  
 * @returns Organization details or null if not found
 */
export const getUserOrganizationDetails = async (userId: string) => {
  try {
    const validation = await validateIndusDashboardUser(userId);
    if (validation.success && validation.data) {
      return {
        organizationId: validation.data.organization_id,
        organizationName: validation.data.organization.name || 'Unknown Organization',
        userRole: 'owner',
        isActive: validation.data.is_active
      };
    }
    return null;
  } catch (error) {
    return null;
  }
};

/**
 * Check if user has valid Indus Dashboard access (quick check)
 * @param userId - Firebase/Hasura user ID
 * @returns boolean indicating if user has access
 */
export const hasIndusDashboardAccess = async (userId: string): Promise<boolean> => {
  try {
    const validation = await validateIndusDashboardUser(userId);
    return validation.success;
  } catch (error) {
    return false;
  }
};

/**
 * Fetch organizations for ACTIVE OWNERS only (for organization selection page)
 * This dashboard is restricted to users who are both is_active=true AND is_owner=true
 * @param userId - Firebase/Hasura user ID
 * @returns Array of organizations where the user is an active owner
 */
export const fetchUserOrganizations = async (userId: string) => {
  try {
    // Step 1: Check if user currently has Hasura claims
    let hasuraUserId = await checkHasuraUserId();
    let hasuraUserIdString: string | null = null;
    
    if (hasuraUserId && typeof hasuraUserId === 'string') {
      hasuraUserIdString = hasuraUserId;
    }
    
    // Step 2: If no claims, wait for them to be added
    if (!hasuraUserIdString) {
      hasuraUserIdString = await waitForHasuraClaims(userId);
      
      if (!hasuraUserIdString) {
        throw new Error('Account permissions are being configured. Please try again in a few moments.');
      }
    }

    // Step 3: Use JWT-authenticated GraphQL client to fetch organizations
    const graphqlClient = await client;
    
    const result: ValidationResponse = await graphqlClient.request(
      FETCH_USER_ORGANIZATIONS_QUERY,
      { user_id: hasuraUserIdString },
      hasuraUserIdString // Pass userId for session variables
    );

    return result.organization_user || [];
    
  } catch (error) {
    console.error('Error fetching user organizations:', error);
    throw error;
  }
};

export default {
  validateIndusDashboardUser,
  fetchUserOrganizations,
  getUserOrganizationDetails,
  hasIndusDashboardAccess
};