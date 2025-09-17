import { defineStore } from "pinia";
import { ref } from "vue";

export const useAuthStore = defineStore("authStore", () => {
	//state
	const phoneNumber = ref("");
	const isOTPVerified = ref(false);
	const verificationStarted = ref(false);
	const otpVerificationError = ref("");
	const timer = ref(30);
	const loginConfirmationResult = ref();
	
	// Error popup state
	const errorPopup = ref({
		show: false,
		title: '',
		message: '',
		showRetry: false
	});
	
	//modals
	const showOTPVerificationModal = ref(false);

	//loading states
	const showSignInLoader = ref(false);
	const showOTPSentLoader = ref(true);

	//actions
	const setPhoneNumber = (phone: string) => {
		phoneNumber.value = phone;
	};
	
	const setTimer = (value: number) => {
		timer.value = value;
	};
	
	const setIsOTPVerified = (state: boolean) => {
		isOTPVerified.value = state;
	};

	const setOTPVerificationError = (errorMessage: string) => {
		otpVerificationError.value = errorMessage;
	};

	const setLoginConfirmationResult = (confirmationResult: any) => {
		loginConfirmationResult.value = confirmationResult;
	};

	// Error popup actions
	const showErrorPopup = ({ title = 'Error', message, showRetry = false }: { title?: string; message: string; showRetry?: boolean }) => {
		errorPopup.value = {
			show: true,
			title,
			message,
			showRetry
		};
	};

	const hideErrorPopup = () => {
		errorPopup.value.show = false;
	};

	//toggles
	const toggleSignInLoader = (state: boolean) => {
		showSignInLoader.value = state;
	};

	const toggleShowOTPSentLoader = (state: boolean) => {
		showOTPSentLoader.value = state;
	};

	const toggleVerificationStarted = (state: boolean) => {
		verificationStarted.value = state;
	};

	const toggleOTPVerificationModal = (state: boolean) => {
		showOTPVerificationModal.value = state;
	};

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
		setPhoneNumber,
		toggleOTPVerificationModal,
		toggleShowOTPSentLoader,
		setIsOTPVerified,
		toggleVerificationStarted,
		setOTPVerificationError,
		setLoginConfirmationResult,
		toggleSignInLoader,
		showErrorPopup,
		hideErrorPopup,
		timer,
		setTimer,
	};
});

export default useAuthStore;