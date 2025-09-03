/**
 * General utility functions and validation helpers
 */

import { getCurrentUser as getFirebaseCurrentUser } from "../firebase";

export const validatePhoneNumber = (phoneNumber) => {
	// Indian phone number validation (10 digits)
	const phoneRegex = /^[6-9]\d{9}$/;
	return phoneRegex.test(phoneNumber);
};

export const getCurrentUser = async () => {
	try {
		return await getFirebaseCurrentUser();
	} catch (error) {
		console.error("Error getting current user:", error);
		return null;
	}
};