/**
 * User utility functions
 */

/**
 * Get the current Firebase user ID from localStorage
 * @returns string | null - Firebase user ID or null if not found
 */
export const getCurrentUserId = (): string | null => {
	return localStorage.getItem('firebaseUserId');
};

/**
 * Check if user is authenticated (has valid user ID)
 * @returns boolean - true if user is authenticated
 */
export const isUserAuthenticated = (): boolean => {
	const userId = getCurrentUserId();
	return userId !== null && userId.length > 0;
};

/**
 * Clear user ID from storage
 */
export const clearUserId = (): void => {
	localStorage.removeItem('firebaseUserId');
};