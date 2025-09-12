import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { GraphQLClient } from 'graphql-request';

// Import the Firebase app to ensure it's initialized before using auth
import '../firebase';

// Use existing Firebase auth instance to avoid multiple app initializations
let auth: any = null;

// Lazy initialization to avoid circular imports
const getFirebaseAuth = async (): Promise<any> => {
	if (!auth) {
		try {
			// Wait a bit for Firebase to initialize if needed
			const maxRetries = 5;
			let retries = 0;
			
			while (retries < maxRetries) {
				try {
					auth = getAuth();
					if (auth && auth.app) {
						break;
					}
				} catch (initError) {
					if (retries === maxRetries - 1) {
						throw initError;
					}
					retries++;
					// Small delay before retry
					await new Promise(resolve => setTimeout(resolve, 100));
				}
			}
		} catch (error) {
			// If no Firebase app exists, return null and handle gracefully
			console.warn('Firebase app not initialized yet:', error.message);
			return null;
		}
	}
	return auth;
};

let currentToken: string | null = null;

const getToken = (): Promise<string> => {
	return new Promise(async (resolve, reject) => {
		if (currentToken) {
			resolve(currentToken);
		} else {
			const firebaseAuth = await getFirebaseAuth();
			if (!firebaseAuth) {
				reject(new Error('Firebase not initialized yet'));
				return;
			}
			
			// Check if user is already available
			const user = firebaseAuth.currentUser;
			if (user) {
				user.getIdToken(true)
					.then(token => {
						currentToken = token;
						resolve(token);
					})
					.catch(reject);
				return;
			}
			
			// Listen for auth state changes
			const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
				unsubscribe();
				if (user) {
					try {
						const userToken = await user.getIdToken(true);
						currentToken = userToken;
						resolve(userToken);
					} catch (error) {
						reject(error);
					}
				} else {
					reject(new Error('User not found.'));
				}
			});
		}
	});
};

const withJWTRefresh = async <T>(action: () => Promise<T>): Promise<T> => {
	try {
		const result = await action();
		return result;
	} catch (error) {
		const errorExtensionsCode = error?.response?.errors[0]?.extensions?.code;
		
		// Handle both invalid JWT and JWT claims errors
		if (errorExtensionsCode === 'invalid-jwt' || errorExtensionsCode === 'jwt-invalid-claims') {
			console.log('JWT error detected, refreshing token:', errorExtensionsCode);
			
			try {
				// Clear current token to force refresh
				currentToken = null;
				
				// Get fresh token with force refresh
				const newToken = await getToken();
				currentToken = newToken;
				
				// Update the GraphQL client with new token
				graphQLClient.setHeader('Authorization', `Bearer ${newToken}`);
				
				// Retry the action with refreshed token
				const result = await action();
				return result;
			} catch (retryError) {
				// If retry also fails, check if it's still a claims issue
				if (retryError?.response?.errors?.[0]?.extensions?.code === 'jwt-invalid-claims') {
					console.error('Token refresh failed - Hasura claims still missing after refresh');
					throw new Error('Authentication failed: Token does not contain required Hasura claims. Please contact support.');
				}
				throw retryError;
			}
		} else {
			throw error;
		}
	}
};

const graphQLClient = new GraphQLClient(
	import.meta.env.VITE_GRAPHQL_SCHEMA_PATH || 'https://graphql.fuelbuddy.in/v1/graphql'
);

const createClient = async (): Promise<{
	request: (query: any, variables?: any, userId?: string) => Promise<any>;
}> => {
	try {
		// Wait for Firebase auth to be ready before getting token
		const firebaseAuth = await getFirebaseAuth();
		if (!firebaseAuth || !firebaseAuth.currentUser) {
			// Don't log error if no user is authenticated yet - this is normal during app startup
			console.log('GraphQL client created without authentication - waiting for user login');
			return createUnauthenticatedClient();
		}
		
		// Try to get token
		const token = await getToken();
		graphQLClient.setHeader('Authorization', `Bearer ${token}`);
		return {
			request: (query, variables, userId) => {
				// Set Hasura session variables if userId is provided
				if (userId) {
					graphQLClient.setHeader('x-hasura-user-id', userId);
				}
				return withJWTRefresh(() => graphQLClient.request(query, variables));
			}
		};
	} catch (error) {
		// Only log as warning if we expected a user but couldn't get token
		console.warn('GraphQL client created without authentication:', error.message);
		return createUnauthenticatedClient();
	}
};

// Helper function to create unauthenticated client
const createUnauthenticatedClient = () => {
	return {
		request: async (query, variables, userId) => {
			try {
				// Try to get token on each request
				const token = await getToken();
				graphQLClient.setHeader('Authorization', `Bearer ${token}`);
				// Set Hasura session variables if userId is provided
				if (userId) {
					graphQLClient.setHeader('x-hasura-user-id', userId);
				}
				return await withJWTRefresh(() => graphQLClient.request(query, variables));
			} catch (authError) {
				// If still no auth, make request without token (will likely fail, but let Hasura handle it)
				console.warn('Making GraphQL request without authentication:', authError.message);
				if (userId) {
					graphQLClient.setHeader('x-hasura-user-id', userId);
				}
				return await graphQLClient.request(query, variables);
			}
		}
	};
};

const client = createClient();

export default client;