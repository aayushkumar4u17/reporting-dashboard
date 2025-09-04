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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Handle auth state changes
onAuthStateChanged(auth, async (user) => {
	const userStore = useUserStore();
	
	if (user) {
		try {
			// Store Firebase user ID
			localStorage.setItem("firebaseUserId", user.uid);
			userStore.setUser(user);
			
			// Set login state
			setReportingLoginState();
			
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