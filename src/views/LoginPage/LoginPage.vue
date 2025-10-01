<template>
  <div class="login-page" :class="{ 'fade-in': isLoaded }">
    <div class="welcome-container" :class="{ 'fade-in': isLoaded }">
      <div class="welcome-logo" :class="{ 'animate-bounce': isLoaded }">
        <img src="/fuelbuddy-logo.svg" alt="FuelBuddy Logo" class="logo-image" />
      </div>
      
      <h1 class="welcome-title" :class="{ 'slide-in-left': isLoaded }">
        Welcome back!
      </h1>
      <p class="welcome-subtitle" :class="{ 'slide-in-right': isLoaded }">
        Sign in to your account to continue
      </p>
      
      <div class="phone-input-section" :class="{ 'slide-in-up': isLoaded }">
        <label class="phone-label">Phone Number</label>
        <div 
          class="phone-input-container" 
          :class="{ 'focused': isInputFocused }"
        >
          <div class="country-code">
            <svg class="flag-icon" width="20" height="15" viewBox="0 0 20 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="20" height="5" fill="#FF9933"/>
              <rect y="5" width="20" height="5" fill="#FFFFFF"/>
              <rect y="10" width="20" height="5" fill="#138808"/>
              <circle cx="10" cy="7.5" r="2" fill="none" stroke="#000080" stroke-width="0.3"/>
              <g transform="translate(10,7.5)">
                <path d="M0,-1.5 L0.3,-0.5 L1.5,-0.5 L0.6,0.1 L0.9,1.1 L0,0.5 L-0.9,1.1 L-0.6,0.1 L-1.5,-0.5 L-0.3,-0.5 Z" fill="#000080" transform="scale(0.4)"/>
              </g>
            </svg>
            <span class="country-text">+91</span>
          </div>
          <input 
            type="tel" 
            v-model="phoneNumber" 
            class="phone-input" 
            placeholder="Enter your phone number"
            maxlength="10"
            @focus="isInputFocused = true"
            @blur="isInputFocused = false"
            @input="formatPhoneNumber"
          />
        </div>
        
        <div class="agreement-section">
          <label class="agreement-label" :class="{ 'checked': isAgreed }" @click="isAgreed = !isAgreed">
            <input 
              type="checkbox" 
              v-model="isAgreed" 
              class="agreement-checkbox"
            />
            I agree to the 
            <span class="terms-link" @click.stop="showTermsPopup = true">Terms of Service & Privacy Policy</span> 
            
          </label>
        </div>
        
        <AnimatedButton 
          v-if="!otpSent"
          @click="sendOTPHandler" 
          :disabled="!isPhoneNumberValid || !isAgreed"
          :loading="isLoading"
          variant="primary"
          size="large"
          style="width: 100%;"
        >
          Send OTP
        </AnimatedButton>
        

      </div>
    </div>
  </div>
  
  <!-- OTP Popup -->
  <div v-if="otpSent" class="otp-popup-overlay" :class="{ 'show': otpSent }" @click="closeOtpPopup">
    <div class="otp-popup" @click.stop :class="{ 'animate-popup': otpSent }">
      <div class="otp-popup-header">
        <h3>Enter OTP</h3>
        <button class="close-btn" @click="closeOtpPopup">×</button>
      </div>
      
      <div class="otp-popup-content">
        <p class="otp-info">We've sent a 6-digit code to +91 {{ phoneNumber }}</p>
        
        <div class="otp-input-container" :class="{ 'focused': isOtpFocused }">
          <input 
            type="text" 
            v-model="otpCode" 
            class="otp-input" 
            placeholder="Enter 6-digit OTP"
            maxlength="6"
            @focus="isOtpFocused = true"
            @blur="isOtpFocused = false"
            @input="formatOTP"
            ref="otpInputRef"
          />
        </div>
        
        <div class="otp-actions">
          <AnimatedButton 
            @click="verifyOTPHandler" 
            :disabled="!otpCode || otpCode.length !== 6"
            :loading="isVerifying"
            variant="primary"
            size="large"
            style="width: 100%; margin-bottom: 0.75rem;"
          >
            Verify OTP
          </AnimatedButton>
          
          <AnimatedButton 
            @click="resendOTPHandler" 
            :disabled="!canResendOTP"
            :loading="isResending"
            variant="secondary"
            size="medium"
            style="width: 100%;"
          >
            <span v-if="resendTimer > 0">Resend in {{ resendTimer }}s</span>
            <span v-else-if="isResending">Sending...</span>
            <span v-else>Resend OTP</span>
          </AnimatedButton>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Error Popup -->
  <ErrorPopup 
    :show="authStore.errorPopup.show"
    :title="authStore.errorPopup.title"
    :message="authStore.errorPopup.message"
    :showRetry="authStore.errorPopup.showRetry"
    @close="handleErrorClose"
    @retry="handleErrorRetry"
    style="z-index: 10000;"
  />
  
  <!-- Terms Popup -->
  <TermsPopup 
    :show="showTermsPopup"
    @close="showTermsPopup = false"
    @agree="handleTermsAgree"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'

// Components
import ErrorPopup from '@/components/layout/ErrorPopup.vue'
import AnimatedButton from '@/components/layout/AnimatedButton.vue'
import TermsPopup from '@/components/layout/TermsPopup.vue'

// Import Firebase Auth actions
import { useAuthStore } from '@/stores'
import { sendOTP as sendOTPAction, verifyOTP as verifyOTPAction } from '@/api/auth'
import { startTimer } from '@/api/auth'
// Removed unused imports: formatTime, validatePhoneNumber, auth

const router = useRouter()
const authStore = useAuthStore()

const phoneNumber = ref('')
const isAgreed = ref(false)
const showTermsPopup = ref(false)
const isLoaded = ref(false)
const isInputFocused = ref(false)
const isLoading = ref(false)

// OTP related states
const otpSent = ref(false)
const otpCode = ref('')
const isOtpFocused = ref(false)
const isVerifying = ref(false)
const isResending = ref(false)
const resendTimer = ref(0)
let resendInterval: ReturnType<typeof setInterval> | null = null
const otpInputRef = ref<HTMLInputElement | null>(null)

const setupRecaptcha = () => {
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
        // Ignore errors during cleanup
      }
    });
  });
  
  try {
    if ((window as any).grecaptcha) {
      (window as any).grecaptcha.reset();
    }
  } catch (e) {
    // Ignore if grecaptcha is not available
  }
}

onMounted(() => {
  // Show the page immediately
  isLoaded.value = true;
  
  // Setup reCAPTCHA early and preload container
  setupRecaptcha();
  
  // Preload recaptcha container for faster OTP sending
  setTimeout(() => {
    try {
      const preloadContainer = document.createElement("div");
      preloadContainer.id = "recaptcha-preload";
      preloadContainer.style.cssText = 'display: none !important; visibility: hidden !important; position: absolute; top: -9999px; left: -9999px;';
      document.body.appendChild(preloadContainer);
    } catch (e) {
      // Ignore preload errors
    }
  }, 1000);
  
  // Remove automatic redirect check to prevent navigation loops
})

onUnmounted(() => {
  if (resendInterval !== null) {
    clearInterval(resendInterval)
    resendInterval = null
  }
  
  // Clean up reCAPTCHA on unmount
  setupRecaptcha()
})

// Watch for confirmation result from auth store
watch(
  () => authStore.loginConfirmationResult,
  (confirmationResult) => {
    if (confirmationResult) {
      isLoading.value = false
      // OTP popup is already shown, just ensure focus
      setTimeout(() => {
        if (otpInputRef.value) {
          otpInputRef.value.focus()
        }
      }, 50)
    }
  }
)

const sendOTPHandler = async () => {
  if (isPhoneNumberValid.value && isAgreed.value) {
    isLoading.value = true
    
    try {
      setupRecaptcha()
      await sendOTPAction(`+91${phoneNumber.value}`, (confirmationResult) => {
        authStore.setLoginConfirmationResult(confirmationResult)
      })
      startTimer()
      isLoading.value = false
      
      // Show OTP popup only after successful send
      otpSent.value = true
      startResendTimer()
      
      // Focus OTP input
      setTimeout(() => {
        if (otpInputRef.value) {
          otpInputRef.value.focus()
        }
      }, 100)
    } catch (error: unknown) {
      isLoading.value = false
      
      if (error && typeof error === 'object' && 'message' in error && error.message === 'Unauthorized user') {
        authStore.showErrorPopup({
          title: 'Unauthorized Access',
          message: 'Only organization owners can access the reporting dashboard',
          showRetry: false
        })
      } else {
        authStore.showErrorPopup({
          title: 'Error Sending OTP',
          message: 'Unable to send OTP. Please try again.',
          showRetry: true
        })
      }
    }
  }
}

const verifyOTPHandler = async () => {
  if (otpCode.value && otpCode.value.length === 6) {
    isVerifying.value = true
    
    try {
      const result = await verifyOTPAction({
        otp: otpCode.value,
        confirmationResult: authStore.loginConfirmationResult
      })
      
      if (result.success) {
        // Small delay to ensure sessionStorage is properly set
        setTimeout(() => {
          router.push('/select-user')
        }, 100)
      } else {
        // Clear OTP on failure and show error
        otpCode.value = ''
        isVerifying.value = false
        
        // Handle specific error codes
        if (result.errorCode === 'auth/invalid-verification-code') {
          authStore.showErrorPopup({
            title: 'Invalid OTP',
            message: 'Invalid OTP. Please try again.',
            showRetry: true
          })
        } else if (result.errorCode === 'auth/code-expired') {
          authStore.showErrorPopup({
            title: 'OTP Expired',
            message: 'The OTP has expired. Please request a new one.',
            showRetry: true
          })
        } else if (result.errorCode !== 'USER_NOT_FOUND' && result.errorCode !== 'AUTH_ERROR') {
          authStore.showErrorPopup({
            title: 'Verification Failed',
            message: result.error || 'OTP verification failed. Please try again.',
            showRetry: true
          })
        }
      }
    } catch (error: unknown) {
      // Clear OTP on error
      otpCode.value = ''
      isVerifying.value = false
      
      // Show appropriate error message
      if (error && typeof error === 'object' && 'code' in error) {
        if (error.code === 'auth/invalid-verification-code') {
          authStore.showErrorPopup({
            title: 'Incorrect OTP',
            message: 'Incorrect OTP. Please try again.',
            showRetry: true
          })
        } else if (error.code === 'auth/code-expired') {
          authStore.showErrorPopup({
            title: 'OTP Expired',
            message: 'The OTP has expired. Please request a new one.',
            showRetry: true
          })
        } else {
          authStore.showErrorPopup({
            title: 'Verification Error',
            message: 'An error occurred during verification. Please try again.',
            showRetry: true
          })
        }
      } else {
        authStore.showErrorPopup({
          title: 'Verification Error',
          message: 'An error occurred during verification. Please try again.',
          showRetry: true
        })
      }
    }
  }
}

const resendOTPHandler = async () => {
  if (resendTimer.value === 0 && !isResending.value) {
    isResending.value = true
    
    // Phone number is already validated and cleaned
    const numberToValidate = phoneNumber.value
    
    try {
      setupRecaptcha() // Clean up any existing recaptcha containers
      
      await sendOTPAction(`+91${numberToValidate}`, (confirmationResult) => {
        authStore.setLoginConfirmationResult(confirmationResult)
      })
      
      otpCode.value = ''
      startResendTimer()
      // Note: We don't call startTimer() here as it's for the main OTP expiry (30 minutes)
      // The resend timer is separate (30 seconds)
      
    } catch (error: unknown) {
      // Parse error for better user feedback
      let errorMessage = 'Error resending OTP. Please try again.'
      
      if (error && typeof error === 'object' && 'code' in error) {
        switch (error.code) {
          case 'auth/too-many-requests':
            errorMessage = 'Too many requests. Please wait before trying again.'
            break
          case 'auth/invalid-phone-number':
            errorMessage = 'Invalid phone number. Please check and try again.'
            break
          case 'auth/captcha-check-failed':
            errorMessage = 'Verification failed. Please refresh the page and try again.'
            break
          case 'auth/app-not-authorized':
            errorMessage = 'App not authorized. Please contact support.'
            break
          default:
            if (error && typeof error === 'object' && 'message' in error) {
              errorMessage = `Error: ${error.message}`
            }
        }
      }
      
      // Use error popup instead of alert
      authStore.showErrorPopup({
        title: 'Resend Failed',
        message: errorMessage,
        showRetry: true
      })
    } finally {
      isResending.value = false
    }
  }
}

const startResendTimer = () => {
  // Clear any existing interval first
  if (resendInterval !== null) {
    clearInterval(resendInterval)
  }
  
  resendTimer.value = 30
  resendInterval = setInterval(() => {
    resendTimer.value--
    if (resendTimer.value <= 0) {
      if (resendInterval !== null) {
        clearInterval(resendInterval)
        resendInterval = null
      }
    }
  }, 1000)
}

const formatOTP = () => {
  // Only allow numbers
  otpCode.value = otpCode.value.replace(/[^0-9]/g, '')
}

// Phone number formatting function
const formatPhoneNumber = () => {
  // Only allow numbers
  phoneNumber.value = phoneNumber.value.replace(/[^0-9]/g, '')
  
  // Limit to 10 digits
  if (phoneNumber.value.length > 10) {
    phoneNumber.value = phoneNumber.value.slice(0, 10)
  }
}

// Computed property for phone number validation
const isPhoneNumberValid = computed(() => {
  return phoneNumber.value && phoneNumber.value.length === 10 && /^[0-9]{10}$/.test(phoneNumber.value)
})

// Computed property for resend button state
const canResendOTP = computed(() => {
  return resendTimer.value === 0 && otpSent.value && !isVerifying.value && !isResending.value
})

// Handle error popup retry action
const handleErrorRetry = () => {
  // Check if this is an access denied error (owner role required)
  if (authStore.errorPopup.title === 'Access Denied - Owner Role Required') {
    // Perform complete form reset for "Try Again" functionality
    phoneNumber.value = ''
    otpCode.value = ''
    otpSent.value = false
    isLoading.value = false
    isVerifying.value = false
    isAgreed.value = false
    
    // Clear any timers
    if (resendInterval !== null) {
      clearInterval(resendInterval)
      resendInterval = null
    }
    resendTimer.value = 0
    
    // Clear auth store state
    authStore.setIsOTPVerified(false)
    authStore.setLoginConfirmationResult(null)
    authStore.setPhoneNumber('')
    
    // Focus on phone number input
    setTimeout(() => {
      const phoneInput = document.querySelector('.phone-input') as HTMLInputElement
      if (phoneInput) {
        phoneInput.focus()
      }
    }, 100)
  } else {
    // Regular error retry logic
    // Clear OTP input for retry
    otpCode.value = ''
    
    // If it's an OTP error, focus on OTP input
    if (otpSent.value) {
      // Allow user to enter OTP again
      setTimeout(() => {
        const otpInput = document.querySelector('.otp-input') as HTMLInputElement
        if (otpInput) {
          otpInput.focus()
        }
      }, 100)
    } else {
      // If it's a phone number error, focus on phone input
      setTimeout(() => {
        const phoneInput = document.querySelector('.phone-input') as HTMLInputElement
        if (phoneInput) {
          phoneInput.focus()
        }
      }, 100)
    }
  }
}

// Handle error popup close
const handleErrorClose = () => {
  authStore.hideErrorPopup()
}

// Handle terms agreement
const handleTermsAgree = () => {
  isAgreed.value = true
}

const closeOtpPopup = () => {
  otpSent.value = false
  otpCode.value = ''
  isLoading.value = false
  isVerifying.value = false
  isResending.value = false
  if (resendInterval !== null) {
    clearInterval(resendInterval)
    resendInterval = null
  }
  resendTimer.value = 0
}

</script>

<style scoped>
  @import './LoginPage.css';
</style>