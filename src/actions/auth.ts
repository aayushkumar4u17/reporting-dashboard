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
import { validateIndusDashboardUser } from "./IndusDashboardAuthService";

//utils
import { setReportingLoginState, clearLoginState, setIndusDashboardLoginState } from "../utils/auth";

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
        callback: () => {},
        "error-callback": (error) => {},
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

  } catch (err) {
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

      // Validate user against Indus Dashboard requirements
      const validation = await validateIndusDashboardUser(userId);

      if (!validation.success) {
        // Handle different error types appropriately
        if (validation.errorCode === 'AUTH_ERROR') {
          // Authentication errors - user should try logging in again
          authStore.showErrorPopup({
            title: "Authentication Required",
            message: validation.error,
            showRetry: true,
          });
        } else {
          // Other access errors - user doesn't have permission
          authStore.showErrorPopup({
            title: "Access Denied",
            message: validation.error,
            showRetry: false,
          });
        }

        // Sign out user since they don't have access
        await signOut(auth);
        clearLoginState();
        
        return { success: false, error: validation.error, errorCode: validation.errorCode };
      }

      // Store user ID for backend communication
      localStorage.setItem("firebaseUserId", userId);

      // Store organization details if available
      if (validation.data) {
        localStorage.setItem("userOrganizationId", validation.data.organization_id);
        localStorage.setItem("userOrganizationName", validation.data.organization.name);
      }

      // Set login state for Indus Dashboard
      setIndusDashboardLoginState();
      setReportingLoginState(); // Keep existing reporting state for compatibility
      
      authStore.setIsOTPVerified && authStore.setIsOTPVerified(true);
      authStore.toggleOTPVerificationModal &&
        authStore.toggleOTPVerificationModal(false);

      return { success: true, user, userId, organizationData: validation.data };
    }

    return { success: false, error: "No user found" };
  } catch (error) {
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

export const signOutUser = async (callback) => {
  const userStore = useUserStore();
  const authStore = useAuthStore();

  try {
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
    localStorage.removeItem("userOrganizationId");
    localStorage.removeItem("userOrganizationName");
    clearLoginState();

    // Execute callback if provided
    if (callback && typeof callback === "function") {
      callback();
    }
  } catch (error) {
    // Basic cleanup on error
    clearLoginState();
    userStore.clearUser();
    localStorage.removeItem("firebaseUserId");
    localStorage.removeItem("userOrganizationId");
    localStorage.removeItem("userOrganizationName");

    if (callback && typeof callback === "function") {
      callback();
    }
  }
};