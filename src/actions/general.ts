import { getAuth, onAuthStateChanged } from 'firebase/auth';

// Import the Firebase app to ensure it's initialized before using auth
import '../firebase';

import { signOutUser } from './auth';
import { useUserStore } from '../store';

export const handleClick = () => {
	const button = document.activeElement as HTMLElement;
	button?.blur();
};

/**
 * Get current user - following customer dashboard pattern
 */
export const getCurrentUser = () => {
	const userStore = useUserStore();
	
	return new Promise((resolve) => {
		try {
			// Try to get Firebase auth instance
			const auth = getAuth();
			const unsubscribe = onAuthStateChanged(auth, async (user) => {
				unsubscribe();
				
				if (user) {
					try {
						const claims = (await user.getIdTokenResult(true))?.claims;
						const hasuraClaims = claims?.["https://hasura.io/jwt/claims"];

						if (!hasuraClaims) {
							resolve(null);
							return;
						}

						const xHasuraUserId = hasuraClaims["x-hasura-user-id"];
						
						if (!xHasuraUserId) {
							resolve(null);
							return;
						}
						
						resolve(user);
					} catch (error) {
						resolve(null);
						return;
					}
				} else {
					resolve(null);
				}
			});
		} catch (error) {
			resolve(null);
		}
	});
};

/**
 * Check Hasura User ID - following customer dashboard pattern
 */
export const checkHasuraUserId = async () => {
	return new Promise((resolve) => {
		try {
			// Try to get Firebase auth instance
			const auth = getAuth();
			const unsubscribe = onAuthStateChanged(auth, async (user) => {
				unsubscribe();
				
				if (user) {
					try {
						const claims = (await user.getIdTokenResult(true))?.claims;
						const hasuraClaims = claims?.["https://hasura.io/jwt/claims"];
						const xHasuraUserId = hasuraClaims?.["x-hasura-user-id"];
						
						if (xHasuraUserId) {
							resolve(xHasuraUserId);
						} else {
							resolve(null);
						}
					} catch (error) {
						resolve(null);
					}
				} else {
					resolve(null);
				}
			});
		} catch (error) {
			resolve(null);
		}
	});
};

/**
 * Validate phone number
 */
export const validatePhoneNumber = (phoneNumber) => {
	// Remove any non-digit characters
	const cleanNumber = phoneNumber.replace(/\D/g, '');
	
	// Check if it's a valid 10-digit Indian mobile number
	if (cleanNumber.length === 10 && /^[6-9]\d{9}$/.test(cleanNumber)) {
		return true;
	}
	
	return false;
};