import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  signOut,
  browserLocalPersistence,
  setPersistence
} from "firebase/auth";
import { auth } from "../firebase";

/**
 * Send OTP without pre-verification
 */
export const sendOTP = async (phoneNumber: string, setConfirmationResult: (result: any) => void) => {
  await setPersistence(auth, browserLocalPersistence);
  
  const recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", { size: "invisible" });
  const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
  setConfirmationResult(confirmationResult);
  recaptchaVerifier.clear();
};

/**
 * Verify OTP and check owner role
 */
export const verifyOTP = async ({ otp, confirmationResult }) => {
  const result = await confirmationResult.confirm(otp);
  const user = result.user;
  
  if (user) {
    const tokenResult = await user.getIdTokenResult(true);
    const hasuraClaims = tokenResult.claims["https://hasura.io/jwt/claims"];
    const allowedRoles = hasuraClaims?.["x-hasura-allowed-roles"] || [];
    const defaultRole = hasuraClaims?.["x-hasura-default-role"];
    
    // Check if user has owner role
    if (!allowedRoles.includes("owner") && defaultRole !== "owner") {
      await signOut(auth);
      throw new Error("Access denied. Only organization owners can access this dashboard.");
    }
    
    const xHasuraUserId = hasuraClaims?.["x-hasura-user-id"];
    
    if (!xHasuraUserId) {
      throw new Error("User ID not found");
    }
    
    localStorage.setItem("xHasuraUserId", xHasuraUserId);
    localStorage.setItem("isLoggedInOwnerDashboard", "true");
    
    return { success: true, user };
  }
  
  throw new Error("No user found");
};

/**
 * Sign out user
 */
export const signOutUser = async () => {
  localStorage.removeItem("xHasuraUserId");
  localStorage.removeItem("isLoggedInOwnerDashboard");
  await signOut(auth);
  window.location.replace("/login");
};