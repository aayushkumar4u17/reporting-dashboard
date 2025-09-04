/**
 * Authentication utility functions for checking login state
 */

/**
 * Check if user is logged in as reporting dashboard user
 * @returns boolean indicating if user is logged in as owner
 */
export const isReportingLoggedIn = (): boolean => {
	return localStorage.getItem('isLoggedInReportingDashboard') === 'true';
};

/**
 * Check if user has valid login state for reporting dashboard
 * @returns boolean indicating if user can access reporting dashboard
 */
export const canAccessReportingDashboard = (): boolean => {
	try {
		return isReportingLoggedIn();
	} catch (error) {
		console.error('Error checking reporting dashboard access:', error);
		return false;
	}
};

/**
 * Clear all login state flags
 */
export const clearLoginState = (): void => {
	localStorage.setItem('isLoggedInReportingDashboard', 'false');
	localStorage.removeItem('firebaseUserId');
	console.log('Login state cleared');
};

/**
 * Set login state for reporting dashboard
 */
export const setReportingLoginState = (): void => {
	localStorage.setItem('isLoggedInReportingDashboard', 'true');
	console.log('Reporting dashboard login state set');
};

// Import Firebase auth functions
import { getAuth, signOut } from 'firebase/auth';
import { app } from '../firebase/index';

/**
 * Rate limiting utility functions
 */
const RATE_LIMIT_KEY = 'firebase_otp_rate_limit';
const RATE_LIMIT_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

/**
 * Check if user is currently rate limited
 */
export const isRateLimited = () => {
	try {
		const rateLimitData = localStorage.getItem(RATE_LIMIT_KEY);
		if (!rateLimitData) return false;
		
		const { timestamp, attempts } = JSON.parse(rateLimitData);
		const now = Date.now();
		
		// Check if rate limit period has expired
		if (now - timestamp > RATE_LIMIT_DURATION) {
			localStorage.removeItem(RATE_LIMIT_KEY);
			return false;
		}
		
		// Rate limited if more than 3 attempts in 30 minutes
		return attempts >= 3;
	} catch (error) {
		console.error('Error checking rate limit:', error);
		return false;
	}
};

/**
 * Record an OTP request attempt
 */
export const recordOTPAttempt = () => {
	try {
		const now = Date.now();
		const rateLimitData = localStorage.getItem(RATE_LIMIT_KEY);
		
		if (!rateLimitData) {
			// First attempt
			localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({
				timestamp: now,
				attempts: 1
			}));
		} else {
			const { timestamp, attempts } = JSON.parse(rateLimitData);
			
			// Reset if more than 30 minutes have passed
			if (now - timestamp > RATE_LIMIT_DURATION) {
				localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({
					timestamp: now,
					attempts: 1
				}));
			} else {
				// Increment attempts
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

/**
 * Get remaining time until rate limit expires
 */
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

/**
 * Clear rate limiting data
 */
export const clearRateLimit = () => {
	try {
		localStorage.removeItem(RATE_LIMIT_KEY);
		console.log('Rate limit data cleared');
	} catch (error) {
		console.error('Error clearing rate limit:', error);
	}
};

/**
 * Format remaining time for display
 */
export const formatRemainingTime = (milliseconds: number): string => {
	const minutes = Math.floor(milliseconds / (1000 * 60));
	const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
	return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Clear all Firebase cache and authentication data
 */
export const clearFirebaseCache = async () => {
	console.log('Clearing Firebase cache...');
	
	try {
		// 1. Clear localStorage
		clearAllLocalStorage();
		
		// 2. Clear sessionStorage
		clearAllSessionStorage();
		
		// 3. Clear Firebase auth state
		await clearFirebaseAuth();
		
		// 4. Clear IndexedDB Firebase data
		await clearFirebaseIndexedDB();
		
		// 5. Clear browser cache related to Firebase
		await clearBrowserCache();
		
		console.log('Firebase cache cleared successfully');
		return { success: true, message: 'Firebase cache cleared successfully' };
	} catch (error) {
		console.error('Error clearing Firebase cache:', error);
		return { success: false, error: error.message };
	}
};

/**
 * Clear all localStorage entries
 */
export const clearAllLocalStorage = () => {
	console.log('Clearing localStorage...');
	
	// Clear specific Firebase-related entries
	const firebaseKeys = [
		'firebase:authUser:',
		'firebase:persistence:',
		'firebase:host:',
		'firebase:heartbeat:',
		'firebase:installations:',
		'isLoggedInReportingDashboard',
		'firebaseUserId',
		'firebase-analytics-storage',
		'firebase-messaging-storage'
	];
	
	// Remove Firebase-specific keys
	for (let i = localStorage.length - 1; i >= 0; i--) {
		const key = localStorage.key(i);
		if (key && firebaseKeys.some(fbKey => key.includes(fbKey))) {
			localStorage.removeItem(key);
			console.log(`Removed localStorage key: ${key}`);
		}
	}
};

/**
 * Clear all sessionStorage entries
 */
export const clearAllSessionStorage = () => {
	console.log('Clearing sessionStorage...');
	
	// Clear Firebase-related sessionStorage
	for (let i = sessionStorage.length - 1; i >= 0; i--) {
		const key = sessionStorage.key(i);
		if (key && key.includes('firebase')) {
			sessionStorage.removeItem(key);
			console.log(`Removed sessionStorage key: ${key}`);
		}
	}
};

/**
 * Clear Firebase authentication state
 */
export const clearFirebaseAuth = async () => {
	console.log('Clearing Firebase auth state...');
	
	try {
		const auth = getAuth(app);
		
		// Sign out current user if any
		if (auth.currentUser) {
			await signOut(auth);
			console.log('User signed out successfully');
		}
		
		// Force clear auth state
		if (auth._delegate) {
			auth._delegate._currentUser = null;
			auth._delegate._isInitialized = false;
		}
		
	} catch (error) {
		console.error('Error clearing Firebase auth:', error);
		throw error;
	}
};

/**
 * Clear Firebase IndexedDB data
 */
export const clearFirebaseIndexedDB = async () => {
	console.log('Clearing Firebase IndexedDB...');
	
	try {
		if ('indexedDB' in window) {
			// List of Firebase IndexedDB names to clear
			const firebaseDBNames = [
				'firebaseLocalStorageDb',
				'firebase-installations-database',
				'firebase-heartbeat-database',
				'firebase-installations-store'
			];
			
			for (const dbName of firebaseDBNames) {
				try {
					await new Promise((resolve, reject) => {
						const deleteReq = indexedDB.deleteDatabase(dbName);
						deleteReq.onsuccess = () => {
							console.log(`Deleted IndexedDB: ${dbName}`);
							resolve();
						};
						deleteReq.onerror = () => {
							console.log(`IndexedDB ${dbName} not found or already deleted`);
							resolve(); // Don't treat as error
						};
						deleteReq.onblocked = () => {
							console.log(`IndexedDB ${dbName} deletion blocked`);
							resolve(); // Don't treat as error
						};
					});
				} catch (error) {
					console.log(`Could not delete IndexedDB ${dbName}:`, error.message);
				}
			}
		}
	} catch (error) {
		console.error('Error clearing Firebase IndexedDB:', error);
	}
};

/**
 * Clear browser cache related to Firebase
 */
export const clearBrowserCache = async () => {
	console.log('Clearing browser cache...');
	
	try {
		if ('caches' in window) {
			const cacheNames = await caches.keys();
			const firebaseCacheNames = cacheNames.filter(name => 
				name.includes('firebase') || name.includes('workbox')
			);
			
			for (const cacheName of firebaseCacheNames) {
				await caches.delete(cacheName);
				console.log(`Deleted cache: ${cacheName}`);
			}
		}
	} catch (error) {
		console.error('Error clearing browser cache:', error);
	}
};

/**
 * Quick cache clear - essential auth data only
 */
export const quickCacheClear = () => {
	console.log('Performing quick cache clear...');
	
	try {
		// Clear login states
		localStorage.removeItem('isLoggedInReportingDashboard');
		localStorage.removeItem('firebaseUserId');
		
		// Clear Firebase auth persistence
		const authKeys = Object.keys(localStorage).filter(key => 
			key.includes('firebase:authUser:') || 
			key.includes('firebase:persistence:')
		);
		
		authKeys.forEach(key => {
			localStorage.removeItem(key);
		});
		
		console.log('Quick cache clear completed');
	} catch (error) {
		console.error('Error during quick cache clear:', error);
	}
};

/**
 * Reset Firebase app completely
 */
export const resetFirebaseApp = async () => {
	console.log('Resetting Firebase app...');
	
	try {
		// Perform full cache clear
		await clearFirebaseCache();
		
		// Clear rate limit data
		clearRateLimit();
		
		// Force page reload to reset everything
		console.log('Reloading page to complete reset...');
		window.location.reload(true);
		
	} catch (error) {
		console.error('Error resetting Firebase app:', error);
		// Force reload even on error
		window.location.reload(true);
	}
};

// Duplicate functions removed - now defined at the top of the file

/**
 * Enhanced logout with complete application reset
 * This function provides a user-friendly way to perform complete logout
 */
export const performCompleteLogout = async () => {
	console.log('Performing complete logout and reset...');
	
	try {
		// Use the enhanced signOutUser function from auth actions
		const { signOutUser } = await import('../actions/auth.js');
		
		// Perform enhanced logout with complete reset
		await signOutUser(null, { completeReset: true, forceReload: false });
		
		return { success: true, message: 'Complete logout successful' };
		
	} catch (error) {
		console.error('Error during complete logout:', error);
		
		// Fallback to resetFirebaseApp if signOutUser fails
		try {
			await resetFirebaseApp();
			return { success: true, message: 'Fallback reset successful' };
		} catch (fallbackError) {
			console.error('Fallback reset also failed:', fallbackError);
			return { success: false, error: fallbackError.message };
		}
	}
};