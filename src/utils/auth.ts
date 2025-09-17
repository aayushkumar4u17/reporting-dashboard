import { getAuth } from 'firebase/auth';

let authStateCache: { 
  isReportingLoggedIn: boolean | null,
  isIndusDashboardLoggedIn: boolean | null,
  lastChecked: number 
} = {
  isReportingLoggedIn: null,
  isIndusDashboardLoggedIn: null,
  lastChecked: 0
};

const CACHE_EXPIRATION = 5000;

export const isReportingLoggedIn = (): boolean => {
  const now = Date.now();
  
  if (authStateCache.isReportingLoggedIn !== null && 
      (now - authStateCache.lastChecked) < CACHE_EXPIRATION) {
    return authStateCache.isReportingLoggedIn;
  }
  
  const isLoggedIn = localStorage.getItem('isLoggedInReportingDashboard') === 'true';
  authStateCache.isReportingLoggedIn = isLoggedIn;
  authStateCache.lastChecked = now;
  
  return isLoggedIn;
};

export const isIndusDashboardLoggedIn = (): boolean => {
  const now = Date.now();
  
  if (authStateCache.isIndusDashboardLoggedIn !== null && 
      (now - authStateCache.lastChecked) < CACHE_EXPIRATION) {
    return authStateCache.isIndusDashboardLoggedIn;
  }
  
  const isLoggedIn = localStorage.getItem('isLoggedInIndusDashboard') === 'true';
  authStateCache.isIndusDashboardLoggedIn = isLoggedIn;
  authStateCache.lastChecked = now;
  
  return isLoggedIn;
};

export const canAccessReportingDashboard = (): boolean => {
	try {
		return isReportingLoggedIn();
	} catch (error) {
		console.error('Error checking reporting dashboard access:', error);
		return false;
	}
};

export const hasOwnerRole = async (): Promise<boolean> => {
	try {
		const auth = getAuth();
		const user = auth.currentUser;
		
		if (!user) {
			return false;
		}
		
		const idTokenResult = await user.getIdTokenResult(true);
		const hasuraClaims = idTokenResult.claims['https://hasura.io/jwt/claims'] as any;
		
		if (!hasuraClaims) {
			return false;
		}
		
		const allowedRoles = hasuraClaims['x-hasura-allowed-roles'] || [];
		const defaultRole = hasuraClaims['x-hasura-default-role'];
		
		const hasOwnerRole = allowedRoles.includes('owner') || defaultRole === 'owner';
		return hasOwnerRole;
	} catch (error) {
		console.error('Error checking owner role:', error);
		return false;
	}
};

export const canAccessIndusDashboard = (): boolean => {
	try {
		// First check localStorage flags as quick validation
		const hasReportingFlag = localStorage.getItem('isLoggedInReportingDashboard') === 'true';
		const hasIndusFlag = localStorage.getItem('isLoggedInIndusDashboard') === 'true';
		
		// If either flag is missing, definitely not logged in
		if (!hasReportingFlag || !hasIndusFlag) {
			return false;
		}
		
		// Try to get Firebase user
		let hasFirebaseUser = false;
		try {
			const auth = getAuth();
			hasFirebaseUser = !!auth.currentUser;
		} catch (firebaseError) {
			// Firebase might not be initialized yet, but we have localStorage flags
			// This is common during page refresh
			return hasReportingFlag && hasIndusFlag;
		}
		
		// If no Firebase user but we have localStorage flags, return based on flags
		// This handles page refresh scenarios where Firebase takes time to initialize
		if (!hasFirebaseUser) {
			return hasReportingFlag && hasIndusFlag;
		}
		
		// If we have Firebase user, check both login states
		const isIndusLoggedIn = isIndusDashboardLoggedIn();
		const isReportingLoggedInVar = isReportingLoggedIn();
		
		const hasAccess = isIndusLoggedIn && isReportingLoggedInVar;
		
		return hasAccess;
	} catch (error) {
		console.error('Error checking Indus Dashboard access:', error);
		// Fallback to localStorage flags in case of error
		const hasReportingFlag = localStorage.getItem('isLoggedInReportingDashboard') === 'true';
		const hasIndusFlag = localStorage.getItem('isLoggedInIndusDashboard') === 'true';
		return hasReportingFlag && hasIndusFlag;
	}
};

export const invalidateAuthCache = (): void => {
  authStateCache = {
    isReportingLoggedIn: null,
    isIndusDashboardLoggedIn: null,
    lastChecked: 0
  };
};

export const getUserOrganizationData = (): { id: string; name: string } | null => {
	try {
		const orgId = localStorage.getItem('userOrganizationId');
		const orgName = localStorage.getItem('userOrganizationName');
		
		if (orgId && orgName) {
			return { id: orgId, name: orgName };
		}
		return null;
	} catch (error) {
		console.error('Error getting organization data:', error);
		return null;
	}
};

export const isOrganizationOwner = async (): Promise<boolean> => {
	try {
		if (!canAccessIndusDashboard()) {
			return false;
		}
		
		return true;
	} catch (error) {
		console.error('Error checking organization owner status:', error);
		return false;
	}
};

export const initializeAuthState = async (): Promise<void> => {
	try {
		const auth = getAuth();
		
		// Extended auth check with more attempts for better reliability
		let attempts = 0;
		const maxAttempts = 20;
		while (!auth.currentUser && attempts < maxAttempts) {
			attempts++;
			await new Promise(resolve => setTimeout(resolve, 100));
		}
		
		const hasFirebaseUser = !!auth.currentUser;
		
		if (!hasFirebaseUser) {
			const hasReportingFlag = localStorage.getItem('isLoggedInReportingDashboard') === 'true';
			const hasIndusFlag = localStorage.getItem('isLoggedInIndusDashboard') === 'true';
			
			if (hasReportingFlag || hasIndusFlag) {
				clearLoginState();
			}
		}
		
		invalidateAuthCache();
		
	} catch (error) {
		console.error('Error initializing auth state:', error);
	}
};

export const clearLoginState = (): void => {
	localStorage.setItem('isLoggedInReportingDashboard', 'false');
	localStorage.setItem('isLoggedInIndusDashboard', 'false');
	localStorage.removeItem('firebaseUserId');
	localStorage.removeItem('userOrganizationId');
	localStorage.removeItem('userOrganizationName');
	
  invalidateAuthCache();
};

export const setReportingLoginState = (): void => {
	localStorage.setItem('isLoggedInReportingDashboard', 'true');
	invalidateAuthCache();
};

export const setIndusDashboardLoginState = (): void => {
	localStorage.setItem('isLoggedInIndusDashboard', 'true');
	invalidateAuthCache();
};

const RATE_LIMIT_KEY = 'firebase_otp_rate_limit';
const RATE_LIMIT_DURATION = 30 * 60 * 1000;

export const isRateLimited = () => {
	try {
		const rateLimitData = localStorage.getItem(RATE_LIMIT_KEY);
		if (!rateLimitData) return false;
		
		const { timestamp, attempts } = JSON.parse(rateLimitData);
		const now = Date.now();
		
		if (now - timestamp > RATE_LIMIT_DURATION) {
			localStorage.removeItem(RATE_LIMIT_KEY);
			return false;
		}
		
		return attempts >= 3;
	} catch (error) {
		console.error('Error checking rate limit:', error);
		return false;
	}
};

export const recordOTPAttempt = () => {
	try {
		const now = Date.now();
		const rateLimitData = localStorage.getItem(RATE_LIMIT_KEY);
		
		if (!rateLimitData) {
			localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({
				timestamp: now,
				attempts: 1
			}));
		} else {
			const { timestamp, attempts } = JSON.parse(rateLimitData);
			
			if (now - timestamp > RATE_LIMIT_DURATION) {
				localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({
					timestamp: now,
					attempts: 1
				}));
			} else {
				localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({
					timestamp,
					attempts: attempts + 1
				}));
			}
		}
	} catch (error) {
		console.error('Error recording OTP attempt:', error);
	}
};

export const getRateLimitRemainingTime = () => {
	try {
		const rateLimitData = localStorage.getItem(RATE_LIMIT_KEY);
		if (!rateLimitData) return 0;
		
		const { timestamp } = JSON.parse(rateLimitData);
		const now = Date.now();
		const elapsed = now - timestamp;
		const remaining = RATE_LIMIT_DURATION - elapsed;
		
		return remaining > 0 ? remaining : 0;
	} catch (error) {
		console.error('Error getting rate limit time:', error);
		return 0;
	}
};

export const clearRateLimit = () => {
	try {
		localStorage.removeItem(RATE_LIMIT_KEY);
	} catch (error) {
		console.error('Error clearing rate limit:', error);
	}
};

export const formatRemainingTime = (milliseconds: number): string => {
	const minutes = Math.floor(milliseconds / (1000 * 60));
	const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
	return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};