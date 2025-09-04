//dependencies
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut,
} from "firebase/auth";

//store
import { useAuthStore, useUserStore } from "../store";

//imports
import { auth } from "../firebase";
import router from "../router";
import client from "./GraphQLClient";

//utils
import { setReportingLoginState, clearLoginState } from "../utils/auth";

// GraphQL query - simplified to check any user access
const CHECK_USER_ACCESS_QUERY = `
  query checkUserAccess($user_id: uuid!) {
    organization_user(where: {user_id: {_eq: $user_id}}) {
      id
      user_id
      organization_id
      organization {
        id
        name
      }
      user {
        id
        first_name
        last_name
      }
    }
  }
`;

export const startTimer = () => {
  const authStore = useAuthStore();
  authStore.setTimer(1800);

  const countdown = () => {
    if (authStore.timer > 0) {
      authStore.setTimer(authStore.timer - 1);
      setTimeout(countdown, 1000);
    }
  };

  countdown();
};

export const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
};

export const sendOTP = async (phoneNumber, setConfirmationResult) => {
  const authStore = useAuthStore();

  try {
    if (!auth) {
      throw new Error("Firebase Auth is not initialized");
    }

    // Create recaptcha container
    let recaptchaContainer = document.getElementById("recaptcha-container");
    if (!recaptchaContainer) {
      recaptchaContainer = document.createElement("div");
      recaptchaContainer.setAttribute("id", "recaptcha-container");
      recaptchaContainer.setAttribute("class", "hidden");
      recaptchaContainer.style.position = "absolute";
      recaptchaContainer.style.top = "-9999px";
      recaptchaContainer.style.left = "-9999px";
      document.body.appendChild(recaptchaContainer);
    }

    const recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "invisible",
        callback: () => console.log("reCAPTCHA solved"),
        "error-callback": (error) => console.error("reCAPTCHA error:", error),
      }
    );

    const confirmationResult = await signInWithPhoneNumber(
      auth,
      phoneNumber,
      recaptchaVerifier
    );

    setConfirmationResult(confirmationResult);
    authStore.toggleShowOTPSentLoader &&
      authStore.toggleShowOTPSentLoader(false);
    recaptchaVerifier.clear();

    // Clean up recaptcha container
    const recaptchaDiv = document.getElementById("recaptcha-container");
    recaptchaDiv?.remove();

    console.log("OTP sent successfully to:", phoneNumber);
  } catch (err) {
    console.error("Error sending OTP:", err);
    authStore.toggleOTPVerificationModal &&
      authStore.toggleOTPVerificationModal(false);

    if (err.code === "auth/too-many-requests") {
      authStore.showErrorPopup({
        title: "Too Many Requests",
        message: "Too many OTP requests. Please wait before trying again.",
        showRetry: false,
      });
    } else if (err.code === "auth/invalid-phone-number") {
      authStore.showErrorPopup({
        title: "Invalid Phone Number",
        message: "Invalid phone number. Please check and try again.",
        showRetry: true,
      });
    } else {
      authStore.showErrorPopup({
        title: "Error Sending OTP",
        message: "Error sending OTP. Please try again.",
        showRetry: true,
      });
    }

    // Clean up recaptcha container
    const recaptchaDiv = document.getElementById("recaptcha-container");
    recaptchaDiv?.remove();

    throw err;
  }
};

export const verifyOTP = async ({ otp, confirmationResult }) => {
  const authStore = useAuthStore();

  try {
    const result = await confirmationResult.confirm(otp);
    const user = result.user;

    if (user) {
      // Get Firebase user ID
      const userId = user.uid;

      // Skip user access check - allow any authenticated user
      console.log("User authenticated successfully, granting access");

      // Store user ID for backend communication
      localStorage.setItem("firebaseUserId", userId);

      // Set login state
      setReportingLoginState();
      authStore.setIsOTPVerified && authStore.setIsOTPVerified(true);
      authStore.toggleOTPVerificationModal &&
        authStore.toggleOTPVerificationModal(false);

      console.log("OTP verified and access granted. User ID:", userId);
      return { success: true, user, userId };
    }

    return { success: false, error: "No user found" };
  } catch (error) {
    console.error("Error verifying OTP:", error);

    if (error.code === "auth/invalid-verification-code") {
      authStore.showErrorPopup({
        title: "Invalid OTP",
        message: "The OTP you entered is incorrect. Please try again.",
        showRetry: true,
      });
    } else if (error.code === "auth/code-expired") {
      authStore.showErrorPopup({
        title: "OTP Expired",
        message: "The OTP has expired. Please request a new code.",
        showRetry: true,
      });
    } else if (error.code === "auth/too-many-requests") {
      authStore.showErrorPopup({
        title: "Too Many Attempts",
        message:
          "Too many unsuccessful attempts. Please wait before trying again.",
        showRetry: false,
      });
    } else {
      authStore.showErrorPopup({
        title: "Authentication Failed",
        message: "Authentication failed. Please try again.",
        showRetry: true,
      });
    }

    return { success: false, error: error.message };
  }
};

/**
 * Check user access with GraphQL query
 */
export const checkUserAccess = async (userId) => {
  try {
    const graphqlClient = await client;
    const result = await graphqlClient.request(CHECK_USER_ACCESS_QUERY, {
      user_id: userId,
    }, userId);

    // Check if user exists in organization_user table
    const userAccess = result.organization_user;
    return userAccess && userAccess.length > 0;
  } catch (error) {
    console.error("Error checking user access:", error);
    return false;
  }
};

export const signOutUser = async (callback) => {
  const userStore = useUserStore();
  const authStore = useAuthStore();

  try {
    console.log("Signing out user...");

    // Sign out from Firebase
    await signOut(auth);

    // Clear user store
    userStore.clearUser();

    // Reset auth store state
    if (authStore.hideErrorPopup) authStore.hideErrorPopup();
    if (authStore.setIsOTPVerified) authStore.setIsOTPVerified(false);
    if (authStore.setLoginConfirmationResult)
      authStore.setLoginConfirmationResult(null);
    if (authStore.setPhoneNumber) authStore.setPhoneNumber("");

    // Clear localStorage
    localStorage.removeItem("firebaseUserId");
    clearLoginState();

    console.log("Logout completed successfully");

    // Execute callback if provided
    if (callback && typeof callback === "function") {
      callback();
    }
  } catch (error) {
    console.error("Error during logout:", error);

    // Basic cleanup on error
    clearLoginState();
    userStore.clearUser();
    localStorage.removeItem("firebaseUserId");

    if (callback && typeof callback === "function") {
      callback();
    }
  }
};
