import { defineStore } from "pinia";
import { ref } from "vue";

export const useUserStore = defineStore("userStore", () => {
	const user = ref(null);
	const profile = ref(null);

	const setUser = (newUser) => {
		user.value = newUser;
	};

	const setProfile = (newProfile) => {
		profile.value = newProfile;
	};

	const clearUser = () => {
		user.value = null;
		profile.value = null;
	};

	return {
		user,
		profile,
		setUser,
		setProfile,
		clearUser,
	};
});

export default useUserStore;