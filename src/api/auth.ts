import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut,
} from "firebase/auth";
import { useAuthStore, useUserStore } from "@/stores";
import { auth } from "@/config/firebase";
import { validateIndusDashboardUser } from "./IndusDashboardAuthService";
import { setReportingLoginState, clearLoginState, setIndusDashboardLoginState } from "@/utils/auth";

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

export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
};

export const sendOTP = async (phoneNumber: string, setConfirmationResult: (result: any) => void): Promise<void> => {
  const authStore = useAuthStore();

  try {
    if (!auth) {
      throw new Error("Firebase Auth is not initialized");
    }

    if (document.readyState === 'loading') {
      await new Promise(resolve => {
        const handler = () => {
          document.removeEventListener('DOMContentLoaded', handler);
          resolve(void 0);
        };
        document.addEventListener('DOMContentLoaded', handler);
      });
    }

    const cleanup = () => {
      const selectors = [
        '[id*="recaptcha"]',
        '[class*="recaptcha"]',
        'iframe[src*="recaptcha"]',
        '.g-recaptcha'
      ];
      
      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          try {
            element.remove();
          } catch (e) {
            // Ignore removal errors
          }
        });
      });
    };
    
    cleanup();
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let recaptchaContainer: HTMLElement;
    
    try {
      recaptchaContainer = document.createElement("div");
      recaptchaContainer.id = "recaptcha-container";
      recaptchaContainer.style.cssText = 'display: none !important; visibility: hidden !important; position: absolute; top: -9999px; left: -9999px; width: 1px; height: 1px; overflow: hidden;';
      
      if (!document.body) {
        throw new Error("Document body not available");
      }
      
      document.body.appendChild(recaptchaContainer);
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const containerCheck = document.getElementById("recaptcha-container");
      if (!containerCheck) {
        throw new Error("Failed to create reCAPTCHA container");
      }
      
    } catch (containerError) {
      console.error('Failed to create reCAPTCHA container:', containerError);
      throw new Error("Unable to initialize reCAPTCHA. Please refresh the page and try again.");
    }

    let recaptchaVerifier;
    try {
      recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
          callback: (response: any) => {
            console.log('reCAPTCHA solved:', !!response);
          },
          "error-callback": (error: any) => {
            console.error('reCAPTCHA error callback:', error);
          },
        }
      );
      
    } catch (verifierError) {
      console.error('Failed to create reCAPTCHA verifier:', verifierError);
      cleanup();
      throw new Error("Failed to initialize reCAPTCHA verifier. Please try again.");
    }

    let confirmationResult;
    try {
      confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      
    } catch (otpError) {
      console.error('Failed to send OTP:', otpError);
      
      // Clean up verifier on error
      try {
        recaptchaVerifier.clear();
      } catch (clearError) {
        console.warn('Error clearing reCAPTCHA verifier:', clearError);
      }
      
      cleanup();
      throw otpError;
    }

    setConfirmationResult(confirmationResult);
    authStore.toggleShowOTPSentLoader && authStore.toggleShowOTPSentLoader(false);
    
    try {
      recaptchaVerifier.clear();
    } catch (clearError) {
      console.warn('Error clearing reCAPTCHA verifier after success:', clearError);
    }

    setTimeout(() => {
      cleanup();
    }, 2000);

  } catch (err: any) {
    console.error('sendOTP error:', err);
    
    authStore.toggleOTPVerificationModal && authStore.toggleOTPVerificationModal(false);

    setTimeout(() => {
      const selectors = [
        '[id*="recaptcha"]',
        '[class*="recaptcha"]',
        'iframe[src*="recaptcha"]',
        '.g-recaptcha'
      ];
      
      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          try {
            element.remove();
          } catch (e) {
            // Ignore removal errors
          }
        });
      });
    }, 500);
    if (err.code === "auth/too-many-requests") {
      authStore.showErrorPopup({
        title: "Too Many Requests",
        message: "Too many OTP requests. Please wait a few minutes before trying again.",
        showRetry: false,
      });
    } else if (err.code === "auth/invalid-phone-number") {
      authStore.showErrorPopup({
        title: "Invalid Phone Number",
        message: "Please enter a valid 10-digit phone number and try again.",
        showRetry: true,
      });
    } else if (err.code === "auth/app-not-authorized") {
      authStore.showErrorPopup({
        title: "App Not Authorized",
        message: "This app is not authorized to use Firebase Authentication. Please contact support.",
        showRetry: false,
      });
    } else if (err.code === "auth/captcha-check-failed") {
      authStore.showErrorPopup({
        title: "Verification Failed",
        message: "reCAPTCHA verification failed. Please refresh the page and try again.",
        showRetry: true,
      });
    } else if (err.message && err.message.includes('reCAPTCHA')) {
      authStore.showErrorPopup({
        title: "reCAPTCHA Error",
        message: "There was an issue with the security verification. Please refresh the page and try again.",
        showRetry: true,
      });
    } else if (err.message && err.message.includes('container')) {
      authStore.showErrorPopup({
        title: "Initialization Error",
        message: "Failed to initialize the verification system. Please refresh the page and try again.",
        showRetry: true,
      });
    } else {
      authStore.showErrorPopup({
        title: "Error Sending OTP",
        message: `Unable to send OTP: ${err.message || 'Unknown error'}. Please try again.`,
        showRetry: true,
      });
    }

    throw err;
  }
};

export const verifyOTP = async ({ otp, confirmationResult }: { otp: string; confirmationResult: any }): Promise<{ success: boolean; error?: string; errorCode?: string; user?: any; userId?: string; organizationData?: any }> => {
  const authStore = useAuthStore();

  try {
    const result = await confirmationResult.confirm(otp);
    const user = result.user;

    if (user) {
      // Get Firebase user ID
      const userId = user.uid;

      const validation = await validateIndusDashboardUser(userId);

      if (!validation.success) {
        if (validation.errorCode === 'AUTH_ERROR') {
          // Provide clean, environment-appropriate error messages
          const isDev = import.meta.env.MODE === 'development';
          let title = "Account Setup in Progress";
          let message = validation.error || "Account permissions are being configured.";
          
          if (isDev) {
            title = "Development Environment";
            // Use the error message as-is from the validation service
            message = validation.error || "Backend services are starting up. Please wait a moment and try again.";
          }
          
          authStore.showErrorPopup({
            title,
            message,
            showRetry: true,
          });
        } else if (validation.errorCode === 'NOT_OWNER') {
          authStore.showErrorPopup({
            title: "Access Denied - Owner Privileges Required",
            message: "This dashboard is only accessible to users with owner privileges in the organization. Please contact your administrator if you believe you should have access.",
            showRetry: true
          });
        } else {
          authStore.showErrorPopup({
            title: "Access Denied",
            message: validation.error || "Access denied",
            showRetry: false,
          });
          
          // Remove the automatic page refresh that was causing issues
          // setTimeout(() => {
          //   window.location.href = '/login';
          // }, 3000);
        }

        await signOut(auth);
        clearLoginState();
        
        return { success: false, error: validation.error, errorCode: validation.errorCode };
      }

      localStorage.setItem("firebaseUserId", userId);

      if (validation.data) {
        localStorage.setItem("userOrganizationId", validation.data.organization_id);
        localStorage.setItem("userOrganizationName", validation.data.organization.name || "Unknown Organization");
      }

      setIndusDashboardLoginState();
      setReportingLoginState();
      
      authStore.setIsOTPVerified && authStore.setIsOTPVerified(true);
      authStore.toggleOTPVerificationModal &&
        authStore.toggleOTPVerificationModal(false);

      return { success: true, user, userId, organizationData: validation.data };
    }

    return { success: false, error: "No user found" };
  } catch (error: any) {
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

export const signOutUser = async (callback?: () => void): Promise<void> => {
  const userStore = useUserStore();
  const authStore = useAuthStore();

  try {
    await signOut(auth);
    userStore.clearUser();

    if (authStore.hideErrorPopup) authStore.hideErrorPopup();
    if (authStore.setIsOTPVerified) authStore.setIsOTPVerified(false);
    if (authStore.setLoginConfirmationResult)
      authStore.setLoginConfirmationResult(null);
    if (authStore.setPhoneNumber) authStore.setPhoneNumber("");

    localStorage.removeItem("firebaseUserId");
    localStorage.removeItem("userOrganizationId");
    localStorage.removeItem("userOrganizationName");
    clearLoginState();

    if (callback && typeof callback === "function") {
      callback();
    }
  } catch (error: any) {
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