<script setup>
//imports
import { useRouter } from "vue-router";
import { useErrorHandler } from "@/composables/useErrorHandler";

//components
import Navbar from "@/components/common/Navbar.vue";
import ErrorNotification from "@/components/ErrorNotification.vue";
import AuthGuard from "@/components/AuthGuard.vue";

const router = useRouter();
const { errorState, hideError, handleRetry } = useErrorHandler();

const routesWithoutXPadding = ["/dashboard", "/point-of-contact", "/my-orders", "/my-invoices", "/payments"];
</script>

<template>
	<main>
		<!-- Wrap entire app with AuthGuard except login page -->
		<template v-if="router.currentRoute.value.fullPath === '/login'">
			<!-- Login page - no authentication required -->
			<router-view></router-view>
		</template>
		<AuthGuard v-else>
			<!-- Protected content - requires authentication -->
			<Navbar
				v-if="
					router.currentRoute.value.fullPath !== '/login' &&
					router.currentRoute.value.fullPath !== '/' &&
					router.currentRoute.value.fullPath !== '/select-user'
				" />
			<div
				v-if="router.currentRoute.value.fullPath === '/select-user'"
				class="fullscreen-content">
				<router-view></router-view>
			</div>
			<div
				v-else
				class="content-wrapper"
				:class="
					routesWithoutXPadding.includes(
						router.currentRoute.value.fullPath,
					)
						? 'with-sidebar'
						: 'without-sidebar'
				">
				<router-view></router-view>
			</div>
		</AuthGuard>
		
		<!-- Global Error Notification -->
		<ErrorNotification
			:show="errorState.show"
			:title="errorState.title"
			:message="errorState.message"
			:details="errorState.details"
			:show-retry="errorState.showRetry"
			@close="hideError"
			@retry="handleRetry"
		/>
	</main>
</template>

<style scoped>
/* Global styles for the app */
main {
  height: 100vh;
  background-color: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  overflow: hidden; /* Prevent main container scroll */
}

/* Content wrapper styles */
.content-wrapper {
  height: 100vh;
  overflow-y: auto; /* Allow content to scroll */
  scroll-behavior: smooth;
  scrollbar-width: thin;
  scrollbar-color: #00C851 #f1f1f1;
}

/* With sidebar (dashboard, point-of-contact, my-orders, my-invoices, payments) */
.content-wrapper.with-sidebar {
  margin-left: 180px; /* Account for sidebar width */
  padding-top: 56px; /* Account for navbar height */
  padding-left: 0;
  padding-right: 0;
}

/* Without sidebar (other pages) */
.content-wrapper.without-sidebar {
  padding-top: 72px; /* 56px navbar + 16px extra */
  padding-left: 3rem;
  padding-right: 3rem;
  margin-left: auto;
  margin-right: auto;
}

/* Fullscreen content for user selection */
.fullscreen-content {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .content-wrapper.with-sidebar {
    margin-left: 0;
    padding-top: 100px; /* Account for mobile navbar + sidebar */
  }
  
  .content-wrapper.without-sidebar {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>
