/**
 * Indus Dashboard Authentication Service
 * Handles validation of users against organisation_user table for dashboard access
 * Uses JWT authentication instead of admin secrets for security
 */

import client from './APIClient';
import { checkHasuraUserId } from './general';
import { getAuth } from 'firebase/auth';

// Determine if we're in development mode
const isDevelopment = import.meta.env.MODE === 'development';

// TypeScript interfaces for the validation response
export interface OrganizationUser {
  id: string;
  user_id: string;
  is_active: boolean;
  is_owner: boolean;
  organization_id: string;
  organization_user_type?: string;
  organization: {
    id: string;
    name?: string | null;
    is_active: boolean;
    created_at?: string;
  };
  user: {
    id: string;
    first_name?: string | null;
    last_name?: string | null;
    phone_number?: string | null;
    email?: string | null;
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
 * Refresh token with retry mechanism
 * @param uid - Firebase user ID
 * @param maxAttempts - Maximum number of retry attempts
 * @returns Promise<boolean> - Returns true if refresh was successful
 */
const refreshTokenWithRetry = async (uid: string, maxAttempts: number = 3): Promise<boolean> => {
  // In development, skip token refresh as the endpoint may not be available
  if (isDevelopment) {
    console.log('Development mode: skipping token refresh');
    return false;
  }
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const url = `https://us-central1-fuelbuddy-india.cloudfunctions.net/refreshToken?uid=${uid}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      await response.json(); // We don't need to use the data, just check if the request was successful
      
      console.log(`Token refresh successful on attempt ${attempt}`);
      return true;
    } catch (error: any) {
      console.warn(`Token refresh attempt ${attempt} failed:`, {
        message: error.message,
        // For fetch errors, we don't have response object like axios
        status: error.status || 'unknown',
      });
      
      // Handle specific error cases that should not be retried
      if (error.status === 400) {
        console.warn('Bad request (400) - invalid user ID or malformed request. Stopping retries.');
        return false;
      }
      
      if (error.status === 401) {
        console.warn('Unauthorized (401) - invalid or expired credentials. Stopping retries.');
        return false;
      }
      
      if (error.status === 404) {
        console.warn('Refresh token endpoint not found (404). Stopping retries.');
        return false;
      }
      
      if (error.status === 403) {
        console.warn('Forbidden (403) - insufficient permissions. Stopping retries.');
        return false;
      }
      
      // Handle network errors
      if (error.message && (error.message.includes('fetch') || error.message.includes('network'))) {
        console.warn('Network error - this may be due to connectivity issues');
        if (attempt >= maxAttempts) {
          return false;
        }
      }
      
      // Only retry for 5xx server errors or timeout errors
      const shouldRetry = (error.status && error.status >= 500) || 
        (error.message && (error.message.includes('timeout') || error.message.includes('fetch')));
      
      if (!shouldRetry) {
        console.warn(`Error ${error.status || 'unknown'} is not retryable. Stopping attempts.`);
        return false;
      }
      
      // If it's the last attempt, don't wait
      if (attempt < maxAttempts) {
        // Exponential backoff: 2s, 4s, 6s
        const delay = 2000 * attempt;
        console.log(`Retrying token refresh in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  console.warn('All token refresh attempts failed');
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
        console.log(`Hasura claims found on attempt ${attempt}`);
        return hasuraUserId;
      }
      
      // If no claims and it's not the last attempt, handle based on environment
      if (attempt < maxAttempts) {
        if (isDevelopment) {
          // In development, skip token refresh and just wait
          console.log(`Development mode: waiting for claims without refresh on attempt ${attempt}`);
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          // Force refresh the token locally to check for claims
          const auth = getAuth();
          const user = auth.currentUser;
          if (user) {
            try {
              await user.getIdToken(true); // Force refresh
            } catch (tokenError) {
              console.warn('Failed to refresh token locally:', tokenError);
            }
          }
        } else {
          // In production, try to refresh token
          try {
            const refreshed = await refreshTokenWithRetry(userId, 1); // Single attempt
            
            if (refreshed) {
              // Wait a bit for the claims to propagate
              const waitTime = Math.min(3000 + (attempt * 1000), 5000);
              console.log(`Waiting ${waitTime}ms for claims to propagate after refresh...`);
              await new Promise(resolve => setTimeout(resolve, waitTime));
              
              // Force refresh the token locally
              const auth = getAuth();
              const user = auth.currentUser;
              if (user) {
                try {
                  await user.getIdToken(true); // Force refresh
                } catch (tokenError) {
                  console.warn('Failed to refresh token locally:', tokenError);
                }
              }
            } else {
              // Still wait a bit in case the token gets refreshed by other means
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
          } catch (refreshError: any) {
            console.warn(`Refresh error on attempt ${attempt}:`, refreshError.message);
            // Still wait a bit in case the token gets refreshed by other means
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      }
      
    } catch (error: any) {
      console.warn(`Error checking Hasura claims on attempt ${attempt}:`, error.message);
      // Don't give up immediately on error, wait and try again
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  
  console.warn('Failed to get Hasura claims after all attempts');
  return null;
};

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
      console.log('Found existing Hasura claims');
    }
    
    // Step 2: If no claims, wait for them to be added (but don't fail immediately)
    if (!hasuraUserIdString) {
      console.log('No Hasura claims found, attempting to get them...');
      
      // In development, provide a more helpful message
      if (isDevelopment) {
        console.warn('Development environment: Hasura claims not available');
        return {
          success: false,
          error: 'Development Environment: Backend services are starting up. Please wait a moment and try logging in again.',
          errorCode: 'AUTH_ERROR'
        };
      }
      
      // In production, try to get claims
      hasuraUserIdString = await waitForHasuraClaims(userId);
      
      if (!hasuraUserIdString) {
        // Don't fail immediately - provide specific messaging about configuration
        console.warn('Hasura claims not available after waiting - user may need setup');
        
        return {
          success: false,
          error: 'Account permissions not yet configured. Please contact support or try again later.',
          errorCode: 'AUTH_ERROR'
        };
      }
    }

    // Step 3: Use JWT-authenticated GraphQL client for user validation
    try {
      console.log('Validating user with Hasura user ID:', hasuraUserIdString);
      const graphqlClient = await client();
      
      // Use the SDK method instead of generic request
      const result = await graphqlClient.validateIndusDashboardUser({
        user_id: hasuraUserIdString
      });

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

      console.log('User validation successful');
      return {
        success: true,
        data: organizationUser
      };
      
    } catch (graphqlError: any) {
      console.error('GraphQL validation error:', graphqlError);
      
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

  } catch (error: any) {
    console.error('Validation error:', error);
    
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
  } catch (error: any) {
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
  } catch (error: any) {
    return false;
  }
};

/**
 * Fetch organizations with DELIVERY type only (for organization selection page)
 * @param userId - Firebase/Hasura user ID
 * @returns Array of organizations where organization_user_type is DELIVERY
 */
export const fetchUserOrganizations = async (userId: string) => {
  try {
    let hasuraUserId = await checkHasuraUserId();
    let hasuraUserIdString: string | null = null;
    
    if (hasuraUserId && typeof hasuraUserId === 'string') {
      hasuraUserIdString = hasuraUserId;
    }
    
    if (!hasuraUserIdString) {
      hasuraUserIdString = await waitForHasuraClaims(userId);
      
      if (!hasuraUserIdString) {
        throw new Error('Account permissions are being configured. Please try again in a few moments.');
      }
    }

    const graphqlClient = await client();
    
    const result = await graphqlClient.fetchUserOrganizations({
      user_id: hasuraUserIdString
    });

    const allOrganizations = result.organization_user || [];
    
    // Filter only by organization_user_type = DELIVERY
    const filteredOrganizations = allOrganizations.filter(orgUser => {
      return orgUser.organization_user_type === 'DELIVERY';
    });
    
    return filteredOrganizations;
    
  } catch (error: any) {
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