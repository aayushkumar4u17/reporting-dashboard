import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '@/firebase';

import { signOutUser } from './GraphQLAuth';
import { useUserStore } from '@/store';

export const handleClick = () => {
	const button = document.activeElement;
	(button)?.blur();
};

/**
 * Get current user - following customer dashboard pattern
 */
export const getCurrentUser = () => {
	const userStore = useUserStore();
	
	return new Promise((resolve) => {
		const auth = getAuth(app);
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
					console.error('Error checking user owner status:', error);
					resolve(null);
					return;
				}
			} else {
				resolve(null);
			}
		});
	});
};

/**
 * Check Hasura User ID - following customer dashboard pattern
 */
export const checkHasuraUserId = async () => {
	return new Promise((resolve) => {
		const auth = getAuth(app);
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
					console.error('Error getting Hasura user ID:', error);
					resolve(null);
				}
			} else {
				resolve(null);
			}
		});
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