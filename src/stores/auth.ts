import { defineStore } from "pinia"
import { ref } from "vue"

export const useAuthStore = defineStore("authStore", () => {
  const phoneNumber = ref("")
  const isOTPVerified = ref(false)
  const verificationStarted = ref(false)
  const otpVerificationError = ref("")
  const timer = ref(30)
  const loginConfirmationResult = ref()
  
  const errorPopup = ref({
    show: false,
    title: '',
    message: '',
    showRetry: false
  })
  
  const showOTPVerificationModal = ref(false)
  const showSignInLoader = ref(false)
  const showOTPSentLoader = ref(true)

  const setPhoneNumber = (phone: string) => {
    phoneNumber.value = phone
  }
  
  const setTimer = (value: number) => {
    timer.value = value
  }
  
  const setIsOTPVerified = (state: boolean) => {
    isOTPVerified.value = state
  }

  const setOTPVerificationError = (errorMessage: string) => {
    otpVerificationError.value = errorMessage
  }

  const setLoginConfirmationResult = (confirmationResult: any) => {
    loginConfirmationResult.value = confirmationResult
  }

  const showErrorPopup = ({ title = 'Error', message, showRetry = false }: { title?: string; message: string; showRetry?: boolean }) => {
    errorPopup.value = {
      show: true,
      title,
      message,
      showRetry
    }
  }

  const hideErrorPopup = () => {
    errorPopup.value.show = false
  }

  const toggleSignInLoader = (state: boolean) => {
    showSignInLoader.value = state
  }

  const toggleShowOTPSentLoader = (state: boolean) => {
    showOTPSentLoader.value = state
  }

  const toggleVerificationStarted = (state: boolean) => {
    verificationStarted.value = state
  }

  const toggleOTPVerificationModal = (state: boolean) => {
    showOTPVerificationModal.value = state
  }

  return {
    phoneNumber,
    showOTPVerificationModal,
    showOTPSentLoader,
    isOTPVerified,
    verificationStarted,
    otpVerificationError,
    loginConfirmationResult,
    showSignInLoader,
    errorPopup,
    timer,
    setPhoneNumber,
    setTimer,
    setIsOTPVerified,
    setOTPVerificationError,
    setLoginConfirmationResult,
    showErrorPopup,
    hideErrorPopup,
    toggleSignInLoader,
    toggleShowOTPSentLoader,
    toggleVerificationStarted,
    toggleOTPVerificationModal,
  }
})

export default useAuthStore