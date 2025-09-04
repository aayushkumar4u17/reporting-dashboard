import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { GraphQLClient } from 'graphql-request';

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
		if (errorExtensionsCode === 'invalid-jwt') {
			currentToken = null;
			const newToken = await getToken();
			currentToken = newToken;
			
			graphQLClient.setHeader('Authorization', `Bearer ${newToken}`);
			
			const result = await action();
			return result;
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