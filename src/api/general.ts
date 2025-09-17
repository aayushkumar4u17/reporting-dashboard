import { getAuth } from "firebase/auth";

export const getCurrentUserId = (): string | null => {
  const auth = getAuth();
  return auth.currentUser ? auth.currentUser.uid : null;
};

export const checkHasuraUserId = async (): Promise<string | null> => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) return null;
    
    // Get the token with claims
    const idTokenResult = await user.getIdTokenResult(true);
    const hasuraClaims = idTokenResult.claims['https://hasura.io/jwt/claims'] as any;
    
    if (!hasuraClaims) return null;
    
    // Extract the Hasura user ID from claims
    const hasuraUserId = hasuraClaims['x-hasura-user-id'];
    return hasuraUserId && typeof hasuraUserId === 'string' ? hasuraUserId : null;
  } catch (error) {
    console.error('Error checking Hasura user ID:', error);
    return null;
  }
};

export const waitForHasuraClaims = async (maxAttempts = 10): Promise<string | null> => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const hasuraUserId = await checkHasuraUserId();
    if (hasuraUserId) {
      return hasuraUserId;
    }
    
    // Wait before retrying
    await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
  }
  
  return null;
};

export const validatePhoneNumber = (phoneNumber: string): boolean => {
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  
  if (cleanNumber.length === 10 && /^[6-9]\d{9}$/.test(cleanNumber)) {
    return true;
  }
  
  return false;
};