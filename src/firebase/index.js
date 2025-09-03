//dependencies
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import router from "../router";

//store
import { signOutUser } from "../actions/auth";
import { useUserStore } from "../store";

//utils
import { setReportingLoginState, clearLoginState } from "../utils/auth";

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
onAuthStateChanged(auth, async (user) => {
	const userStore = useUserStore();
	
	if (user) {
		// FOR TESTING: Allow any authenticated user
		console.log('Testing mode: Allowing any authenticated user');
		userStore.setUser(user);
		setReportingLoginState();
		
		// Set a dummy user ID for testing
		localStorage.setItem("xHasuraUserId", user.uid);
		
		/* PRODUCTION CODE (commented out for testing):
		try {
			// Get the latest token with claims
			const tokenResult = await user.getIdTokenResult(true);
			const hasuraClaims = tokenResult.claims["https://hasura.io/jwt/claims"];
			
			if (hasuraClaims) {
				const xHasuraUserId = hasuraClaims["x-hasura-user-id"];
				const allowedClaims = hasuraClaims["x-hasura-allowed-roles"];
				
				if (xHasuraUserId) {
					localStorage.setItem("xHasuraUserId", xHasuraUserId);
				}
				
				// Only allow users with reporting or admin roles
				if (allowedClaims && (allowedClaims.includes("reporting") || allowedClaims.includes("admin"))) {
					userStore.setUser(user);
					setReportingLoginState();
				} else {
					// User doesn't have required role - sign them out
					console.log("User lacks required permissions for reporting dashboard");
					localStorage.setItem("isLoggedInReportingDashboard", "false");
					await signOutUser(() => null);
					router.push("/login");
				}
			} else {
				// No Hasura claims - unauthorized user
				console.log("User has no authorization claims");
				localStorage.setItem("isLoggedInReportingDashboard", "false");
				await signOutUser(() => null);
				router.push("/login");
			}
		} catch (error) {
			console.error("Error checking user claims:", error);
			clearLoginState();
			router.push("/login");
		}
		*/
	} else {
		// Clear login state when user is logged out
		clearLoginState();
		router.push("/login");
	}
});

export const getCurrentUser = () => {
	return new Promise((resolve) => {
		const auth = getAuth(app);
		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			unsubscribe();

			// FOR TESTING: Return any authenticated user
			if (user) {
				console.log('Testing mode: Returning authenticated user without role checking');
				resolve(user);
				return;
			}
			
			/* PRODUCTION CODE (commented out for testing):
			if (user) {
				const claims = (await user.getIdTokenResult(true))?.claims;
				const hasuraClaims = claims?.["https://hasura.io/jwt/claims"];

				if (!hasuraClaims) {
					resolve(null);
					return;
				}

				const allowedClaims = hasuraClaims["x-hasura-allowed-roles"];
				
				if (allowedClaims && (allowedClaims.includes("reporting") || allowedClaims.includes("admin"))) {
					resolve(user);
					return;
				} else {
					alert("You need to be registered as a reporting user to access the application");
					await signOutUser(() => null);
					resolve(null);
					return;
				}
			} else {
				resolve(null);
			}
			*/
			
			resolve(null);
		});
	});
};

export { app, auth };