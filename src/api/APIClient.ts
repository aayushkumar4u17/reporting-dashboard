import { getAuth, onAuthStateChanged } from "firebase/auth";
import { GraphQLClient } from "graphql-request";
import { getSdk, SdkFunctionWrapper } from "../sdk";

let currentToken: string | null = null;

const waitForFirebaseInit = (): Promise<void> => {
  return new Promise((resolve) => {
    // Check if Firebase is already initialized
    try {
      getAuth();
      resolve();
    } catch (error) {
      // Firebase not ready, wait for it
      const checkInterval = setInterval(() => {
        try {
          getAuth();
          clearInterval(checkInterval);
          resolve();
        } catch (e) {
          // Still waiting
        }
      }, 100);
      
      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve();
      }, 10000);
    }
  });
};

const getToken = async (): Promise<string> => {
  if (currentToken) {
    return currentToken;
  }
  
  // Wait for Firebase to be initialized
  await waitForFirebaseInit();
  
  return new Promise<string>((resolve, reject) => {
    try {
      const auth = getAuth();
      
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
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
          reject(new Error("User not found."));
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

const withJWTRefresh: SdkFunctionWrapper = async <T>(
  action: () => Promise<T>,
): Promise<T> => {
  try {
    const result = await action();
    return result;
  } catch (error: any) {
    const errorExtensionsCode =
      error?.response?.errors[0]?.extensions?.code;
    if (errorExtensionsCode === "invalid-jwt") {
      currentToken = null;
      const newToken = await getToken();
      currentToken = newToken;

      graphQLClient.setHeader("Authorization", `Bearer ${newToken}`);

      const result = await action();
      return result;
    } else {
      throw error;
    }
  }
};

const graphQLClient = new GraphQLClient(
  import.meta.env.VITE_GRAPHQL_SCHEMA_PATH,
);

const createClient = async (): Promise<ReturnType<typeof getSdk>> => {
  try {
    const token = await getToken();
    graphQLClient.setHeader("Authorization", `Bearer ${token}`);

    return getSdk(graphQLClient, withJWTRefresh);
  } catch (error) {
    console.error("Error creating GraphQL client:", error);
    // Return client without auth header if token retrieval fails
    return getSdk(graphQLClient);
  }
};

// Don't create client immediately, export a function that creates it when needed
let clientPromise: Promise<ReturnType<typeof getSdk>> | null = null;

const getClient = (): Promise<ReturnType<typeof getSdk>> => {
  if (!clientPromise) {
    clientPromise = createClient();
  }
  return clientPromise;
};

export default getClient;