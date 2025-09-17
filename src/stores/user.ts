import { defineStore } from "pinia";
import { ref } from "vue";

interface UserProfile {
	id: string;
	firstName?: string;
	lastName?: string;
	phoneNumber?: string;
	email?: string;
	organizationName?: string;
	organizationId?: string;
	organizationAvatar?: string;
	organizationInitials?: string;
}

export const useUserStore = defineStore("userStore", () => {
	const user = ref(null);
	const profile = ref<UserProfile | null>(null);

	const setUser = (newUser: any) => {
		user.value = newUser;
	};

	const setProfile = (newProfile: UserProfile | null) => {
		profile.value = newProfile;
	};

	const clearUser = () => {
		user.value = null;
		profile.value = null;
	};

	// Computed getter for display name
	const getDisplayName = (): string => {
		if (!profile.value) return 'User';
		
		const { firstName, lastName } = profile.value;
		
		if (firstName && lastName) {
			return `${firstName} ${lastName}`;
		} else if (firstName) {
			return firstName;
		} else if (lastName) {
			return lastName;
		}
		
		return 'User';
	};

	// Computed getter for organization name
	const getOrganizationName = (): string => {
		return profile.value?.organizationName || 'Unknown Organization';
	};

	return {
		user,
		profile,
		setUser,
		setProfile,
		clearUser,
		getDisplayName,
		getOrganizationName,
	};
});

export default useUserStore;