import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { GraphQLClient } from 'graphql-request';

// Import the Firebase app to ensure it's initialized before using auth
import '../firebase';

// Use existing Firebase auth instance to avoid multiple app initializations
let auth: any = null;

// Lazy initialization to avoid circular imports
const getFirebaseAuth = (): any => {
	if (!auth) {
		try {
			// Try to get existing Firebase auth instance
			auth = getAuth();
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
	return new Promise((resolve, reject) => {
		if (currentToken) {
			resolve(currentToken);
		} else {
			const firebaseAuth = getFirebaseAuth();
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
		// Try to get token, but don't fail if Firebase isn't ready
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
		console.warn('GraphQL client created without authentication:', error.message);
		// Return client without auth header - will be set later when Firebase is ready
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
					// If still no auth, make request without token
					console.warn('Making GraphQL request without authentication:', authError.message);
					// Set Hasura session variables if userId is provided
					if (userId) {
						graphQLClient.setHeader('x-hasura-user-id', userId);
					}
					return await graphQLClient.request(query, variables);
				}
			}
		};
	}
};

const client = createClient();

export default client;