//dependencies
import axios from "axios";
import {
	browserLocalPersistence,
	RecaptchaVerifier,
	setPersistence,
	signInWithPhoneNumber,
	signOut,
} from "firebase/auth";

//actions
import { getCurrentUser } from "./general";

//store
import { useAuthStore, useUserStore } from "../store";

//imports
import { auth } from "../firebase";
import router from "../router";

//utils
import { setReportingLoginState, clearLoginState, clearFirebaseCache, clearRateLimit, resetFirebaseApp } from "../utils/auth";

export const startTimer = () => {
	const authStore = useAuthStore();
	authStore.setTimer(1800); // reset to 30 minutes (1800 seconds)

	const countdown = () => {
		if (authStore.timer > 0) {
			authStore.setTimer(authStore.timer - 1);
			setTimeout(countdown, 1000);
		}
	};

	countdown();
};

export const formatTime = (seconds) => {
	const minutes = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
};

export const sendOTP = async (phoneNumber, setConfirmationResult) => {
	const authStore = useAuthStore();

	try {
		// Check if auth is properly initialized
		if (!auth) {
			throw new Error('Firebase Auth is not initialized');
		}

		// FOR TESTING: Relaxed phone number validation
		console.log('Testing mode: Relaxed phone validation for:', phoneNumber);
		
		/* PRODUCTION CODE (commented out for testing):
		// Additional validation - check if phone number is valid format
		const cleanNumber = phoneNumber.replace(/\D/g, ''); // Remove all non-digits
		if (!cleanNumber.startsWith('91') || cleanNumber.length !== 12) {
			throw new Error('Invalid phone number format. Please use a valid Indian mobile number.');
		}
		*/
		
		// Ensure recaptcha container exists with mobile support
		let recaptchaContainer = document.getElementById("recaptcha-container");
		if (!recaptchaContainer) {
			recaptchaContainer = document.createElement('div');
			recaptchaContainer.setAttribute('id', 'recaptcha-container');
			recaptchaContainer.setAttribute('class', 'hidden');
			recaptchaContainer.style.position = 'absolute';
			recaptchaContainer.style.top = '-9999px';
			recaptchaContainer.style.left = '-9999px';
			document.body.appendChild(recaptchaContainer);
		}
		
		const recaptchaVerifier = new RecaptchaVerifier(
			auth,
			"recaptcha-container",
			{
				size: "invisible",
				callback: () => {
					console.log('reCAPTCHA solved');
				},
				'error-callback': (error) => {
					console.error('reCAPTCHA error:', error);
				}
			}
		);
		
		const confirmationResult = await signInWithPhoneNumber(
			auth,
			phoneNumber,
			recaptchaVerifier,
		);
		
		setConfirmationResult(confirmationResult);
		authStore.toggleShowOTPSentLoader && authStore.toggleShowOTPSentLoader(false);
		recaptchaVerifier.clear();
		
		// Clean up recaptcha container
		const recaptchaDiv = document.getElementById("recaptcha-container");
		recaptchaDiv?.remove();
		
		console.log('OTP sent successfully to:', phoneNumber);
	} catch (err) {
		console.error("Error sending OTP:", err);
		authStore.toggleOTPVerificationModal && authStore.toggleOTPVerificationModal(false);
		
		// Provide specific error messages with popup
		if (err.code === 'auth/too-many-requests') {
			authStore.showErrorPopup({
				title: 'Too Many Requests',
				message: 'You have made too many OTP requests. Please wait 15-30 minutes before trying again, or try using a different phone number.',
				showRetry: false
			});
		} else if (err.code === 'auth/invalid-phone-number') {
			authStore.showErrorPopup({
				title: 'Invalid Phone Number',
				message: 'Invalid phone number. Please check and try again.',
				showRetry: true
			});
		} else if (err.message.includes('Invalid phone number format')) {
			authStore.showErrorPopup({
				title: 'Invalid Format',
				message: err.message,
				showRetry: true
			});
		} else {
			authStore.showErrorPopup({
				title: 'Error Sending OTP',
				message: 'Error sending OTP. Please try again.',
				showRetry: true
			});
		}
		
		// Clean up recaptcha container even on error
		const recaptchaDiv = document.getElementById("recaptcha-container");
		recaptchaDiv?.remove();
		
		throw err;
	}
};

function waitForTimeout(timeout, uid) {
	return new Promise((resolve) => {
		setTimeout(async () => {
			try {
				const result = await axios.get(
					"https://us-central1-fuelbuddy-india.cloudfunctions.net/refreshToken",
					{
						params: {
							uid: `${uid}`,
						},
					},
				);
				resolve(result.data);
			} catch (error) {
				console.error("Error refreshing token:", error);
				resolve(null);
			}
		}, timeout);
	});
}

export const verifyOTP = async ({ otp, confirmationResult }) => {
	const authStore = useAuthStore();

	try {
		const result = await confirmationResult.confirm(otp);
		const user = result.user;

		if (user) {
			// FOR TESTING: Allow any user to login
			console.log('Testing mode: Allowing any user to login');
			
			// Set login state for testing
			setReportingLoginState();
			authStore.setIsOTPVerified && authStore.setIsOTPVerified(true);
			authStore.toggleOTPVerificationModal && authStore.toggleOTPVerificationModal(false);
			
			return { success: true, user };
			
			/* PRODUCTION CODE (commented out for testing):
			// Wait for token refresh to ensure custom claims are available
			await waitForTimeout(3000, user.uid);
			
			// Get fresh token with updated claims
			const tokenResult = await user.getIdTokenResult(true);
			const hasuraClaims = tokenResult.claims["https://hasura.io/jwt/claims"];
			
			if (!hasuraClaims) {
				// If no Hasura claims exist, user is not authorized
				alert("Access denied. You are not authorized to access this application.");
				await signOutUser(() => null);
				return { success: false, error: "No authorization claims found" };
			}
			
			const allowedClaims = hasuraClaims["x-hasura-allowed-roles"];
			
			// Check if user has reporting or admin role
			if (!allowedClaims || (!allowedClaims.includes("reporting") && !allowedClaims.includes("admin"))) {
				alert("Access denied. You need to be registered as a reporting user or admin to access this application.");
				await signOutUser(() => null);
				return { success: false, error: "Insufficient permissions" };
			}
			
			// User is authorized - set login state
			setReportingLoginState();
			authStore.setIsOTPVerified && authStore.setIsOTPVerified(true);
			authStore.toggleOTPVerificationModal && authStore.toggleOTPVerificationModal(false);
			
			return { success: true, user };
			*/
		}
		
		return { success: false, error: "No user found" };
	} catch (error) {
		console.error("Error verifying OTP:", error);
		const authStore = useAuthStore();
		
		// Handle specific error cases with popup
		if (error.code === 'auth/invalid-verification-code') {
			authStore.showErrorPopup({
				title: 'Invalid OTP',
				message: 'The OTP you entered is incorrect. Please check the code and try again.',
				showRetry: true
			});
		} else if (error.code === 'auth/code-expired') {
			authStore.showErrorPopup({
				title: 'OTP Expired',
				message: 'The OTP has expired. Please request a new code.',
				showRetry: true
			});
		} else if (error.code === 'auth/too-many-requests') {
			authStore.showErrorPopup({
				title: 'Too Many Attempts',
				message: 'Too many unsuccessful attempts. Please wait a moment before trying again.',
				showRetry: false
			});
		} else {
			authStore.showErrorPopup({
				title: 'Authentication Failed',
				message: 'Authentication failed. Please try again.',
				showRetry: true
			});
		}
		
		return { success: false, error: error.message };
	}
};

export const signOutUser = async (callback, options = {}) => {
	const userStore = useUserStore();
	const authStore = useAuthStore();
	const { completeReset = false, forceReload = false } = options;
	
	try {
		console.log('Signing out user...');
		
		// Show loading state for logout
		authStore.toggleSignInLoader && authStore.toggleSignInLoader(true);
		
		if (completeReset) {
			// Complete reset - clear everything and reload
			console.log('Performing complete reset...');
			await resetFirebaseApp();
			// resetFirebaseApp handles page reload, so no need for callback
			return;
		}
		
		// Enhanced logout with comprehensive cache clearing
		console.log('Performing enhanced logout with cache clearing...');
		
		// 1. Clear Firebase cache comprehensively
		const cacheResult = await clearFirebaseCache();
		if (!cacheResult.success) {
			console.warn('Cache clearing had issues:', cacheResult.error);
		}
		
		// 2. Clear rate limiting data
		clearRateLimit();
		
		// 3. Clear user store
		userStore.clearUser();
		
		// 4. Reset auth store state
		if (authStore.hideErrorPopup) authStore.hideErrorPopup();
		if (authStore.setIsOTPVerified) authStore.setIsOTPVerified(false);
		if (authStore.toggleVerificationStarted) authStore.toggleVerificationStarted(false);
		if (authStore.setOTPVerificationError) authStore.setOTPVerificationError('');
		if (authStore.setLoginConfirmationResult) authStore.setLoginConfirmationResult(null);
		if (authStore.setPhoneNumber) authStore.setPhoneNumber('');
		if (authStore.setTimer) authStore.setTimer(30);
		
		// 5. Clear additional browser data
		try {
			// Clear any remaining localStorage items that might have been missed
			const keysToRemove = [
				'xHasuraUserId',
				'reportingDashboardState',
				'userPreferences',
				'dashboardCache'
			];
			
			keysToRemove.forEach(key => {
				if (localStorage.getItem(key)) {
					localStorage.removeItem(key);
					console.log(`Removed additional key: ${key}`);
				}
			});
			
			// Clear sessionStorage completely for this app
			sessionStorage.clear();
			console.log('SessionStorage cleared completely');
			
		} catch (storageError) {
			console.warn('Error clearing additional storage:', storageError);
		}
		
		console.log('Enhanced logout completed successfully');
		
		// Hide loading state
		authStore.toggleSignInLoader && authStore.toggleSignInLoader(false);
		
		// Force reload if requested
		if (forceReload) {
			console.log('Force reloading page...');
			window.location.reload(true);
			return;
		}
		
		// Execute callback if provided
		if (callback && typeof callback === 'function') {
			callback();
		}
		
	} catch (error) {
		console.error("Error during enhanced logout:", error);
		
		// Hide loading state on error
		authStore.toggleSignInLoader && authStore.toggleSignInLoader(false);
		
		// Even if enhanced logout fails, ensure basic cleanup
		try {
			// Basic cleanup fallback
			clearLoginState();
			userStore.clearUser();
			localStorage.removeItem("xHasuraUserId");
			sessionStorage.clear();
			
			// Show error popup if available
			if (authStore.showErrorPopup) {
				authStore.showErrorPopup({
					title: 'Logout Warning',
					message: 'Logout completed with some issues. Please clear your browser cache if you experience any problems.',
					showRetry: false
				});
			}
			
			console.log('Basic logout cleanup completed');
			
		} catch (fallbackError) {
			console.error('Critical error during logout fallback:', fallbackError);
		}
		
		// Still execute callback to redirect user
		if (callback && typeof callback === 'function') {
			callback();
		}
	}
};

/**
 * Quick logout - Basic logout with essential cleanup
 */
export const quickLogout = async (callback) => {
	return await signOutUser(callback, { completeReset: false, forceReload: false });
};

/**
 * Complete logout reset - Full reset with page reload
 */
export const completeLogoutReset = async () => {
	return await signOutUser(null, { completeReset: true, forceReload: false });
};

/**
 * Force logout reset - Enhanced logout with forced page reload
 */
export const forceLogoutReset = async (callback) => {
	return await signOutUser(callback, { completeReset: false, forceReload: true });
};