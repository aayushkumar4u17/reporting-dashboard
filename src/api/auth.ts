import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut,
} from "firebase/auth";
import { useAuthStore, useUserStore } from "@/stores";
import { auth } from "@/config/firebase";
import { validateIndusDashboardUser } from "./IndusDashboardAuthService";
import { setReportingLoginState, clearLoginState, setIndusDashboardLoginState, invalidateAuthCache } from "@/utils/auth";
import { clearRouterAuthCache } from "@/router";

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
    await new Promise(resolve => setTimeout(resolve, 100));
    
    let recaptchaContainer: HTMLElement;
    
    try {
      recaptchaContainer = document.createElement("div");
      recaptchaContainer.id = "recaptcha-container";
      recaptchaContainer.style.cssText = 'display: none !important; visibility: hidden !important; position: absolute; top: -9999px; left: -9999px; width: 1px; height: 1px; overflow: hidden;';
      
      if (!document.body) {
        throw new Error("Document body not available");
      }
      
      document.body.appendChild(recaptchaContainer);
      await new Promise(resolve => setTimeout(resolve, 50));
      
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
          "error-callback": (_error: any) => {
            console.error('reCAPTCHA error callback:', { hasError: true });
          },
        }
      );
      
    } catch (verifierError) {
      console.error('Failed to create reCAPTCHA verifier:', { hasError: true });
      cleanup();
      throw new Error("Failed to initialize reCAPTCHA verifier. Please try again.");
    }

    let confirmationResult;
    try {
      confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      
    } catch (otpError) {
      console.error('Failed to send OTP:', { code: (otpError as any)?.code, hasError: true });
      
      // Clean up verifier on error
      try {
        recaptchaVerifier.clear();
      } catch (clearError) {
        console.warn('Error clearing reCAPTCHA verifier:', { hasError: true });
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
    console.error('sendOTP error:', { code: err?.code, hasError: true });
    
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
    // Don't show error popup here - let the component handle it
    return { success: false, error: error.message, errorCode: error.code };
  }
};

export const signOutUser = async (callback?: () => void): Promise<void> => {
  const userStore = useUserStore();
  const authStore = useAuthStore();

  try {
    await signOut(auth);
    
    // Wait for Firebase to fully sign out
    await new Promise(resolve => {
      const unsubscribe = auth.onAuthStateChanged(user => {
        if (!user) {
          unsubscribe();
          resolve(void 0);
        }
      });
    });
    
    userStore.clearUser();

    if (authStore.hideErrorPopup) authStore.hideErrorPopup();
    if (authStore.setIsOTPVerified) authStore.setIsOTPVerified(false);
    if (authStore.setLoginConfirmationResult)
      authStore.setLoginConfirmationResult(null);
    if (authStore.setPhoneNumber) authStore.setPhoneNumber("");

    localStorage.removeItem("firebaseUserId");
    localStorage.removeItem("userOrganizationId");
    localStorage.removeItem("userOrganizationName");
    localStorage.removeItem("selectedOrganization");
    localStorage.removeItem("cachedOrganizations");
    clearLoginState();
    invalidateAuthCache();
    clearRouterAuthCache();

    if (callback && typeof callback === "function") {
      callback();
    }
    
    // Force page refresh to clear all cached state
    window.location.reload();
  } catch (error: any) {
    clearLoginState();
    invalidateAuthCache();
    userStore.clearUser();
    localStorage.removeItem("firebaseUserId");
    localStorage.removeItem("userOrganizationId");
    localStorage.removeItem("userOrganizationName");
    localStorage.removeItem("selectedOrganization");
    localStorage.removeItem("cachedOrganizations");
    clearRouterAuthCache();

    if (callback && typeof callback === "function") {
      callback();
    }
  }
};