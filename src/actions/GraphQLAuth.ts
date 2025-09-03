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
import client from './GraphQLClient';

//store
import { useAuthStore, useUserStore } from "../store";

//imports
import { auth } from "../firebase";
import router from "../router";

//utils
import { setReportingLoginState, clearLoginState } from "../utils/auth";
import { useErrorHandler } from "../composables/useErrorHandler";

// Import generated SDK types and functions
import { getSdk } from '../sdk';

/**
 * Check if user is an owner using generated SDK
 */
export const checkUserOwnerStatus = async (userId: string): Promise<{
	success: boolean;
	is_owner: boolean;
	organizations?: any[];
	message?: string;
	error?: string;
}> => {
	try {
		const graphQLClient = await client;
		const sdk = getSdk(graphQLClient);
		const response = await sdk.checkUserOwnerStatus({
			user_id: userId
		});
		
		console.log('Owner status check response:', response);
		
		const isOwner = response.organization_user && response.organization_user.length > 0;
		
		return {
			success: true,
			is_owner: isOwner,
			organizations: response.organization_user || [],
			message: isOwner ? 'User is an owner' : 'User is not an owner'
		};
	} catch (error) {
		console.error('Error checking owner status:', error);
		return {
			success: false,
			error: error.message || 'Failed to check owner status',
			is_owner: false
		};
	}
};

/**
 * Send OTP to phone number - following customer dashboard pattern
 */
export const sendOTP = async (phoneNumber: string, setConfirmationResult: (result: any) => void): Promise<{ success: boolean }> => {
	const authStore = useAuthStore();

	try {
		await setPersistence(auth, browserLocalPersistence);
		
		authStore.toggleShowOTPSentLoader && authStore.toggleShowOTPSentLoader(true);
		
		const recaptchaVerifier = new RecaptchaVerifier(
			auth,
			"recaptcha-container",
			{
				size: "invisible",
				callback: (response) => {
					console.log("reCAPTCHA solved", response);
				},
				"expired-callback": () => {
					console.log("reCAPTCHA expired");
				},
				"error-callback": (error) => {
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
		const recaptchaDiv = document.getElementById('recaptcha-container');
		if (recaptchaDiv) {
			recaptchaDiv.innerHTML = '';
		}
		
		return { success: true };
	} catch (err) {
		console.error('Error sending OTP:', err);
		authStore.toggleShowOTPSentLoader && authStore.toggleShowOTPSentLoader(false);
		throw err;
	}
};

/**
 * Verify OTP and check owner status using GraphQL
 */
export const verifyOTP = async ({ otp, confirmationResult }: {
	otp: string;
	confirmationResult: any;
}): Promise<{
	success: boolean;
	user?: any;
	error?: string;
}> => {
	const authStore = useAuthStore();
	const { showOwnerAccessError, showAuthenticationError, showTokenError, showNetworkError } = useErrorHandler();

	try {
		const result = await confirmationResult.confirm(otp);
		const user = result.user;

		if (user) {
			// Get user ID from Firebase token
			const tokenResult = await user.getIdTokenResult(true);
			const hasuraClaims = tokenResult.claims["https://hasura.io/jwt/claims"];
			
			if (!hasuraClaims) {
				showTokenError();
				return { success: false, error: "No authorization claims found" };
			}
			
			const xHasuraUserId = hasuraClaims["x-hasura-user-id"];
			
			if (!xHasuraUserId) {
				showTokenError();
				return { success: false, error: "User ID not found" };
			}
			
			// Check if user is an owner using GraphQL
			console.log('Checking owner status for user:', xHasuraUserId);
			const ownerCheckResult = await checkUserOwnerStatus(xHasuraUserId);
			
			if (!ownerCheckResult.success) {
				// Handle API errors
				if (ownerCheckResult.error && ownerCheckResult.error.includes('network')) {
					showNetworkError();
				} else {
					showAuthenticationError();
				}
				return { success: false, error: ownerCheckResult.error };
			}
			
			if (!ownerCheckResult.is_owner) {
				showOwnerAccessError();
				return { success: false, error: "User is not an owner" };
			}
			
			// Store user ID for future use
			localStorage.setItem("xHasuraUserId", xHasuraUserId);
			
			// User is authorized as owner - set login state
			console.log('User verified as owner, granting access');
			setReportingLoginState();
			authStore.setIsOTPVerified && authStore.setIsOTPVerified(true);
			authStore.toggleOTPVerificationModal && authStore.toggleOTPVerificationModal(false);
			
			return { success: true, user };
		}
		
		return { success: false, error: "No user found" };
	} catch (error) {
		console.error("Error verifying OTP:", error);
		
		if (error.code === "auth/invalid-verification-code") {
			return { success: false, error: "Invalid OTP. Please try again." };
		} else if (error.code === "auth/code-expired") {
			return { success: false, error: "OTP has expired. Please request a new one." };
		} else {
			showAuthenticationError();
			return { success: false, error: "OTP verification failed. Please try again." };
		}
	}
};

/**
 * Sign out user - following customer dashboard pattern
 */
export const signOutUser = async (callback?: () => void): Promise<void> => {
	const userStore = useUserStore();

	// Clear user store if available
	if (userStore.$resetStore) {
		userStore.$resetStore();
	}

	// Clear login state flags from localStorage
	clearLoginState();

	await signOut(auth);
	if (callback) {
		callback();
		window.location.replace("/login"); // enforce page refresh to remove old token
	}
};