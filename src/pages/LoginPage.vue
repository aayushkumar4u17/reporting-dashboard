<template>
  <div class="login-page" :class="{ 'fade-in': isLoaded }">
    <div class="welcome-container" :class="{ 'fade-in': isLoaded }">
      <div class="welcome-logo" :class="{ 'animate-bounce': isLoaded }">
        <img src="/fuelbuddy-logo.svg" alt="FuelBuddy Logo" class="logo-image" />
        <!-- <p class="welcome-tagline">Doorstep Fuel Delivery</p> -->
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
import { sendOTP as sendOTPAction, verifyOTP as verifyOTPAction } from '@/actions/GraphQLAuth'
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
  console.log('LoginPage mounted - starting initialization...');
  
  // Set loaded immediately to show the page
  isLoaded.value = true;
  
  try {
    // Check if user is already logged in
    console.log('Checking current user...');
    const user = await getCurrentUser();
    if (user) {
      console.log('User already authenticated, redirecting to user selection');
      router.replace('/select-user');
      return;
    }
    console.log('No authenticated user found, staying on login page');
  } catch (error) {
    console.error('Error checking current user:', error);
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
    // Phone number is already cleaned (only digits)
    const numberToValidate = phoneNumber.value
    
    // Additional validation using the existing function
    if (!validatePhoneNumber(numberToValidate)) {
      authStore.showErrorPopup({
        title: 'Invalid Phone Number',
        message: 'Please enter a valid 10-digit phone number',
        showRetry: true
      })
      return
    }

    isLoading.value = true
    authStore.setPhoneNumber(phoneNumber.value)
    
    // Setup recaptcha container for Firebase
    setupRecaptcha()
    
    try {
      await sendOTPAction(`+91${numberToValidate}`, (confirmationResult) => {
        authStore.setLoginConfirmationResult(confirmationResult)
      })
      startTimer()
    } catch (error) {
      console.error('Error sending OTP:', error)
      isLoading.value = false
      // Error popup is handled in the sendOTPAction function
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
        // Redirect to user selection on successful verification
        router.push('/select-user')
      } else {
        // Clear OTP on failure and show error
        otpCode.value = ''
        isVerifying.value = false
        
        // Show error message if not already shown by error handler
        if (result.error && !result.error.includes('owner') && !result.error.includes('authorization')) {
          authStore.showErrorPopup({
            title: 'Verification Failed',
            message: result.error || 'OTP verification failed. Please try again.',
            showRetry: true
          })
        }
      }
    } catch (error) {
      console.error('Error verifying OTP:', error)
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
      console.log('OTP resent successfully')
    } catch (error) {
      console.error('Error resending OTP:', error)
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
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  min-height: 100vh;
  height: 100vh;
  background-color: #f5f5f5;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.welcome-container {
  background: rgba(255, 255, 255, 0.98);
  padding: 3rem;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  text-align: center;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  position: relative;
  z-index: 1;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.welcome-container.fade-in {
  opacity: 1;
  transform: translateY(0);
}

.welcome-logo {
  margin-bottom: 2rem;
  position: relative;
}

.welcome-logo.animate-bounce {
  animation: gentleBounce 2s ease-in-out 0.5s;
}

.logo-image {
  height: 60px;
  width: auto;
  max-width: 100%;
  object-fit: contain;
  filter: drop-shadow(0 4px 8px rgba(0, 200, 81, 0.2));
  transition: all 0.3s ease;
}

.logo-image:hover {
  filter: drop-shadow(0 6px 12px rgba(0, 200, 81, 0.3));
  transform: scale(1.02);
}

.welcome-tagline {
  font-size: 0.9rem;
  color: #666;
  margin-top: 0.25rem;
  opacity: 0.8;
  transition: opacity 0.3s ease;
}

.welcome-title {
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 0.5rem;
  font-weight: 600;
  opacity: 0;
  transform: translateX(-30px);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.welcome-title.slide-in-left {
  animation: slideInLeft 0.8s ease-out 0.3s forwards;
}

.welcome-subtitle {
  color: #666;
  margin-bottom: 2rem;
  font-size: 1rem;
  opacity: 0;
  transform: translateX(30px);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.welcome-subtitle.slide-in-right {
  animation: slideInRight 0.8s ease-out 0.5s forwards;
}

.phone-input-section {
  text-align: left;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.phone-input-section.slide-in-up {
  animation: slideInUp 0.8s ease-out 0.7s forwards;
}

.phone-label {
  display: block;
  margin-bottom: 1rem;
  color: #333;
  font-weight: 500;
}

.phone-input-container {
  display: flex;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: white;
}

.phone-input-container.focused {
  border-color: #00C851;
  box-shadow: 0 0 0 3px rgba(0, 200, 81, 0.1);
  transform: translateY(-2px);
}

.phone-input-container.valid {
  border-color: #00C851;
  background: rgba(0, 200, 81, 0.02);
}

.phone-input-container:hover {
  border-color: #00C851;
  box-shadow: 0 2px 8px rgba(0, 200, 81, 0.1);
}

.country-code {
  display: flex;
  background: #f8f9fa;
  align-items: center;
  border-right: 1px solid #ddd;
  cursor: pointer;
  min-width: 100px;
  gap: 0.5rem;
  color: #333;
  font-size: 1.3rem;
  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.1));
  padding: 0.75rem;
}

.phone-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  outline: none;
  font-size: 16px;
  -webkit-appearance: none;
  -webkit-border-radius: 0;
}

.validation-message {
  font-size: 0.85rem;
  color: #ff4444;
  margin-top: 0.5rem;
}

.agreement-section {
  margin-bottom: 1.5rem;
}

.agreement-label {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
  color: #666;
  line-height: 1.4;
  transition: all 0.3s ease;
  padding: 0.5rem;
  border-radius: 8px;
}

.agreement-label:hover {
  background: rgba(0, 200, 81, 0.05);
}

.agreement-label.checked {
  color: #00C851;
  background: rgba(0, 200, 81, 0.1);
}

.agreement-checkbox {
  width: 18px;
  height: 18px;
  accent-color: #00C851;
  margin-top: 2px;
}

.terms-link {
  color: #00C851;
  text-decoration: underline;
  cursor: pointer;
  font-weight: 500;
  transition: color 0.2s ease;
}

.terms-link:hover {
  color: #00A03C;
}



/* OTP Section Styles */
.otp-section {
  margin-top: 1.5rem;
  text-align: left;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.otp-section.slide-in-up {
  animation: slideInUp 0.8s ease-out 0.2s forwards;
}

.otp-label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
  font-size: 1rem;
}

.otp-info {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  line-height: 1.4;
}

.otp-input-container {
  margin-bottom: 1.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.otp-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  font-size: 16px;
  text-align: center;
  letter-spacing: 0.5rem;
  font-weight: 600;
  color: #333;
  background: white;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  -webkit-appearance: none;
  -webkit-border-radius: 0;
}

.otp-input:focus {
  outline: none;
  border-color: #00C851;
  box-shadow: 0 0 0 3px rgba(0, 200, 81, 0.1);
  transform: translateY(-2px);
}

.otp-input::placeholder {
  color: #999;
  font-weight: normal;
  letter-spacing: normal;
}

.otp-input-container.focused {
  transform: translateY(-2px);
}

.otp-actions {
  display: flex;
  gap: 0.75rem;
  flex-direction: column;
}





/* Animation Keyframes */
@keyframes gentleBounce {
  0% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
  100% {
    transform: translateY(0);
  }
}



@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .login-page {
    padding: 1rem;
    background-color: #f5f5f5;
    position: fixed;
    overflow: hidden;
  }
  
  .welcome-container {
    padding: 2rem;
    border-radius: 16px;
    margin: 0;
    width: 95%;
    max-height: 85vh;
  }
  
  .logo-image {
    height: 50px;
  }
  
  .welcome-title {
    font-size: 1.6rem;
    margin-bottom: 0.75rem;
  }
  
  .welcome-subtitle {
    font-size: 0.95rem;
    margin-bottom: 1.5rem;
  }
  
  .phone-input-container {
    border-radius: 10px;
  }
  
  .country-code {
    min-width: 90px;
    padding: 0.75rem 0.8rem;
    font-size: 1.05rem;
  }
}

@media (max-width: 480px) {
  .login-page {
    padding: 0.5rem;
    min-height: 100vh;
    height: auto;
    position: relative;
    overflow-y: auto;
  }
  
  .welcome-container {
    padding: 1.5rem;
    border-radius: 12px;
    margin: 0;
    width: 98%;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  
  .logo-image {
    height: 45px;
  }
  
  .welcome-title {
    font-size: 1.4rem;
  }
  
  .welcome-subtitle {
    font-size: 0.9rem;
  }
  
  .phone-input-container {
    margin-bottom: 1.5rem;
  }
  
  .country-code {
    font-size: 0.85rem;
    padding: 0.75rem 0.5rem;
  }
  
  .send-otp-btn {
    padding: 1rem;
    font-size: 1rem;
    margin-top: 1.5rem;
  }
}

@media (max-width: 320px) {
  .welcome-container {
    padding: 1rem;
  }
  
  .logo-image {
    height: 40px;
  }
  
  .welcome-title {
    font-size: 1.2rem;
  }
}

/* OTP Popup Styles */
.otp-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(5px);
}

.otp-popup {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 400px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  transform: scale(0.8) translateY(20px);
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.otp-popup.animate-popup {
  transform: scale(1) translateY(0);
  opacity: 1;
}

.otp-popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.otp-popup-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.2rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #f5f5f5;
  color: #333;
}

.otp-popup-content {
  padding: 1.5rem;
}

/* Landscape orientation on mobile */
@media (max-width: 768px) and (orientation: landscape) {
  .login-page {
    padding: 0.5rem;
  }
  
  .welcome-container {
    padding: 1.5rem;
    max-width: 400px;
  }
  
  .welcome-logo {
    margin-bottom: 1rem;
  }
  
  .fuel-text, .buddy-text {
    font-size: 1.4rem;
  }
}
</style>