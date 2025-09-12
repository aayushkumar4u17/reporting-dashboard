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
            <span class="flag">🇮🇳</span>
            <span>+91</span>
            <span class="dropdown-arrow">▼</span>
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
  <div v-if="otpSent" class="otp-popup-overlay" @click="closeOtpPopup">
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
            :disabled="resendTimer > 0"
            variant="secondary"
            size="medium"
            style="width: 100%;"
          >
            <span v-if="resendTimer > 0">Resend in {{ resendTimer }}s</span>
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

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'

// Components
import ErrorPopup from '@/components/common/ErrorPopup.vue'
import AnimatedButton from '@/components/common/AnimatedButton.vue'
import TermsPopup from '@/components/common/TermsPopup.vue'

// Import Firebase Auth actions
import { useAuthStore } from '@/store'
import { sendOTP as sendOTPAction, verifyOTP as verifyOTPAction } from '@/actions/auth'
import { startTimer, formatTime } from '@/actions/auth'
import { validatePhoneNumber, getCurrentUser } from '@/actions/general'

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
const resendTimer = ref(0)
let resendInterval = null
const otpInputRef = ref(null)

// Firebase setup - create recaptcha container
const setupRecaptcha = () => {
  const existingDiv = document.getElementById('recaptcha-container')
  if (!existingDiv) {
    const recaptchaDiv = document.createElement('div')
    recaptchaDiv.setAttribute('id', 'recaptcha-container')
    recaptchaDiv.setAttribute('class', 'hidden')
    document.body.appendChild(recaptchaDiv)
  }
}

onMounted(async () => {
  // Set loaded immediately to show the page
  isLoaded.value = true;
  
  try {
    // Check if user is already logged in
    const user = await getCurrentUser();
    if (user) {
      router.replace('/select-user');
      return;
    }
  } catch (error) {
    // Continue to show login page even if there's an error
  }
  
  setupRecaptcha();
})

onUnmounted(() => {
  if (resendInterval) {
    clearInterval(resendInterval)
  }
})

// Watch for confirmation result from auth store
watch(
  () => authStore.loginConfirmationResult,
  (confirmationResult) => {
    if (confirmationResult) {
      isLoading.value = false
      otpSent.value = true
      startResendTimer()
      // Auto-focus OTP input after popup appears
      setTimeout(() => {
        if (otpInputRef.value) {
          otpInputRef.value.focus()
        }
      }, 300)
    }
  }
)

const sendOTPHandler = async () => {
  if (isPhoneNumberValid.value && isAgreed.value) {
    isLoading.value = true
    setupRecaptcha()
    
    try {
      await sendOTPAction(`+91${phoneNumber.value}`, (confirmationResult) => {
        authStore.setLoginConfirmationResult(confirmationResult)
      })
      startTimer()
    } catch (error) {
      isLoading.value = false
      
      if (error.message === 'Unauthorized user') {
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
        // Redirect to dashboard on successful verification
        router.push('/select-user')
      } else {
        // Clear OTP on failure and show error
        otpCode.value = ''
        isVerifying.value = false
        
        // For access denied errors, the verifyOTPAction will handle the redirect
        if (result.errorCode !== 'USER_NOT_FOUND' && result.errorCode !== 'AUTH_ERROR') {
          authStore.showErrorPopup({
            title: 'Verification Failed',
            message: result.error || 'OTP verification failed. Please try again.',
            showRetry: true
          })
        }
      }
    } catch (error) {
      // Clear OTP on error
      otpCode.value = ''
      isVerifying.value = false
      
      // Show appropriate error message
      if (error.code === 'auth/invalid-verification-code') {
        authStore.showErrorPopup({
          title: 'Invalid OTP',
          message: 'The OTP you entered is incorrect. Please try again.',
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
    }
  }
}

const resendOTPHandler = async () => {
  if (resendTimer.value === 0) {
    // Phone number is already validated and cleaned
    const numberToValidate = phoneNumber.value
    
    try {
      setupRecaptcha() // Ensure recaptcha container exists
      await sendOTPAction(`+91${numberToValidate}`, (confirmationResult) => {
        authStore.setLoginConfirmationResult(confirmationResult)
      })
      otpCode.value = ''
      startResendTimer()
      startTimer() // Restart the main OTP timer
    } catch (error) {
      // Use error popup instead of alert
      authStore.showErrorPopup({
        title: 'Resend Failed',
        message: 'Error resending OTP. Please try again.',
        showRetry: true
      })
    }
  }
}

const startResendTimer = () => {
  resendTimer.value = 30
  resendInterval = setInterval(() => {
    resendTimer.value--
    if (resendTimer.value <= 0) {
      clearInterval(resendInterval)
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

// Handle error popup retry action
const handleErrorRetry = () => {
  // Clear OTP input for retry
  otpCode.value = ''
  
  // If it's an OTP error, focus on OTP input
  if (otpSent.value) {
    // Allow user to enter OTP again
    setTimeout(() => {
      const otpInput = document.querySelector('.otp-input')
      if (otpInput) {
        otpInput.focus()
      }
    }, 100)
  } else {
    // If it's a phone number error, focus on phone input
    setTimeout(() => {
      const phoneInput = document.querySelector('.phone-input')
      if (phoneInput) {
        phoneInput.focus()
      }
    }, 100)
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
  if (resendInterval) {
    clearInterval(resendInterval)
  }
}

</script>

<style scoped>
  @import './LoginPage.css';
</style>