//dependencies
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import router from "../router";

//actions
import { signOutUser, checkUserOwnerStatus } from "../actions/GraphQLAuth";
import { getCurrentUser } from "../actions/general";
import { useUserStore } from "../store";

//utils
import { setReportingLoginState, clearLoginState } from "../utils/auth";
import { useErrorHandler } from "../composables/useErrorHandler";

// Your web app's Firebase configuration
const firebaseConfig = {
	apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
	authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
	databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
	projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
	storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
	appId: import.meta.env.VITE_FIREBASE_APP_ID,
	measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// redirect after logout
// redirect after logout - following customer dashboard pattern
onAuthStateChanged(auth, async (user) => {
	const userStore = useUserStore();
	
	if (user) {
		try {
			// Get user claims and store Hasura user ID
			const tokenResult = await user.getIdTokenResult(true);
			const hasuraClaims = tokenResult.claims["https://hasura.io/jwt/claims"];
			
			if (!hasuraClaims) {
				console.log("User has no authorization claims");
				clearLoginState();
				await signOutUser(() => null);
				router.push("/login");
				return;
			}
			
			const xHasuraUserId = hasuraClaims["x-hasura-user-id"];
			
			if (!xHasuraUserId) {
				console.log("User ID not found in token");
				clearLoginState();
				await signOutUser(() => null);
				router.push("/login");
				return;
			}
			
			// Store user ID and set user in store
			localStorage.setItem("xHasuraUserId", xHasuraUserId);
			userStore.setUser(user);
			
			// Check if user is an owner and set login state accordingly
			console.log('Checking owner status for user:', xHasuraUserId);
			const ownerCheckResult = await checkUserOwnerStatus(xHasuraUserId);
			
			if (ownerCheckResult.success && ownerCheckResult.is_owner) {
				setReportingLoginState();
				console.log('User verified as owner, access granted');
			} else {
				console.log("User is not an owner or check failed");
				localStorage.setItem("isLoggedInReportingDashboard", "false");
				// Error handling will be done in the auth actions during login flow
			}
			
		} catch (error) {
			console.error('Error during auth state change:', error);
			localStorage.setItem("isLoggedInReportingDashboard", "false");
		}
	} else {
		// Clear login state when user is logged out
		clearLoginState();
		router.push("/login");
	}
});



export { app, auth };