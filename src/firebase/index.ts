//dependencies
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import router from "../router";

//actions
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

// Initialize Firebase with error handling
let app;
let auth;

try {
	app = initializeApp(firebaseConfig);
	auth = getAuth(app);
	console.log('Firebase app initialized successfully');
} catch (error) {
	console.error('Error initializing Firebase:', error);
	throw error;
}

// Handle auth state changes
onAuthStateChanged(auth, async (user) => {
	const userStore = useUserStore();
	
	if (user) {
		try {
			// Store Firebase user ID
			localStorage.setItem("firebaseUserId", user.uid);
			userStore.setUser(user);
			
			// Set basic login state first
			setReportingLoginState();
			
			// Wait for user token to be ready with Hasura claims
			await validateUserPermissions(user);
			
		} catch (error) {
			console.error('Error during auth state change:', error);
			localStorage.setItem("isLoggedInReportingDashboard", "false");
			localStorage.setItem("isLoggedInIndusDashboard", "false");
		}
	} else {
		// Clear login state when user is logged out
		clearLoginState();
		router.push("/login");
	}
});

// Validate user permissions against Hasura database
const validateUserPermissions = async (user) => {
	try {
		// Wait for token with claims (retry mechanism)
		const maxRetries = 10;
		let hasuraUserId = null;
		
		for (let attempt = 1; attempt <= maxRetries; attempt++) {
			try {
				const idToken = await user.getIdToken(true);
				const payload = JSON.parse(atob(idToken.split('.')[1]));
				const hasuraClaims = payload['https://hasura.io/jwt/claims'];
				
				if (hasuraClaims && hasuraClaims['x-hasura-user-id']) {
					hasuraUserId = hasuraClaims['x-hasura-user-id'];
					break;
				}
				
				if (attempt < maxRetries) {
					console.log(`Waiting for Hasura claims... attempt ${attempt}`);
					await new Promise(resolve => setTimeout(resolve, 2000));
				}
			} catch (tokenError) {
				console.warn(`Token attempt ${attempt} failed:`, tokenError);
				if (attempt < maxRetries) {
					await new Promise(resolve => setTimeout(resolve, 2000));
				}
			}
		}
		
		if (!hasuraUserId) {
			console.warn('No Hasura user ID found in token claims');
			return;
		}
		
		// Import GraphQL client and SDK
		const client = await import('../actions/GraphQLClient');
		const { getSdk } = await import('../sdk');
		
		const graphqlClient = await client.default;
		const sdk = getSdk(graphqlClient);
		
		// Query organization_user table to check permissions
		const result = await sdk.validateIndusDashboardUser({ user_id: hasuraUserId });
		
		if (result.organization_user && result.organization_user.length > 0) {
			// Check if user has BOTH active AND owner permissions (dashboard only for active owners)
			const hasActiveOwnerAccess = result.organization_user.some(
				orgUser => orgUser.is_active === true && orgUser.is_owner === true
			);
			
			if (hasActiveOwnerAccess) {
				// User has proper permissions - grant Indus Dashboard access
				localStorage.setItem('isLoggedInIndusDashboard', 'true');
				console.log('Indus Dashboard access granted: User is an active owner');
			} else {
				console.warn('Access denied: User must be both active AND owner to access Indus Dashboard');
				localStorage.setItem('isLoggedInIndusDashboard', 'false');
			}
		} else {
			console.warn('Access denied: User not found in organization_user table');
			localStorage.setItem('isLoggedInIndusDashboard', 'false');
		}
		
	} catch (error) {
		console.error('Error validating user permissions:', error);
		localStorage.setItem('isLoggedInIndusDashboard', 'false');
	}
};



export { app, auth };