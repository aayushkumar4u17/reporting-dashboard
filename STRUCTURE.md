# Industry-Standard Vue 3 Project Structure

## New Folder Organization

```
src/
├── api/                    # API layer (formerly actions/)
│   ├── APIClient.ts
│   ├── auth.ts
│   ├── general.ts
│   ├── IndusDashboardAuthService.ts
│   ├── pointOfContactDashboard.ts
│   ├── pointOfContactDetailedReport.ts
│   ├── pointOfContactInvoiceReport.ts
│   └── index.ts           # Centralized API exports
├── assets/                # Static assets
│   └── main.css
├── components/            # Reusable components
│   ├── layout/           # Layout components (formerly common/)
│   │   ├── AnimatedButton.vue
│   │   ├── ErrorPopup.vue
│   │   ├── Navbar.vue
│   │   ├── SkeletonLoader.vue
│   │   └── TermsPopup.vue
│   ├── ui/               # Base UI components (empty, ready for use)
│   ├── forms/            # Form components (empty, ready for use)
│   ├── AuthGuard.vue
│   ├── ErrorNotification.vue
│   └── index.ts          # Component exports
├── composables/          # Vue composables
│   ├── useErrorHandler.ts
│   ├── useFilters.ts
│   └── useUserProfile.ts
├── config/               # Configuration files (formerly firebase/)
│   ├── firebase.ts
│   └── index.ts
├── constants/            # Application constants
│   └── index.ts
├── layouts/              # Page layouts
│   └── DefaultLayout.vue
├── middleware/           # Route middleware
│   └── auth.ts
├── plugins/              # Vue plugins (empty, ready for use)
├── router/               # Vue Router
│   └── index.ts
├── services/             # Business logic services (formerly graphql/)
│   └── business/
│       ├── fetchUserOrganizations.graphql
│       ├── pointOfContactDashboard.graphql
│       ├── pointOfContactDetailedReport.graphql
│       ├── pointOfContactInvoiceReport.graphql
│       └── validateIndusDashboardUser.graphql
├── stores/               # Pinia stores (formerly store/)
│   ├── auth.ts
│   ├── index.ts
│   ├── pointOfContact.ts
│   └── user.ts
├── types/                # TypeScript type definitions
│   └── index.ts
├── utils/                # Utility functions
│   ├── auth.ts
│   └── user.ts
├── views/                # Page components (formerly pages/)
│   ├── DashboardPage/
│   ├── LoginPage/
│   ├── MyInvoicesPage/
│   ├── MyOrdersPage/
│   ├── PaymentsPage/
│   ├── PointOfContactPage/
│   └── UserSelectionPage/
├── App.vue
├── main.ts
├── sdk.ts
├── sdk.urql.ts
└── vite-env.d.ts
```

## Key Improvements

1. **Clearer Separation of Concerns**: Each folder has a specific purpose
2. **Industry Standards**: Follows Vue 3 and modern frontend conventions
3. **Better Scalability**: Structure supports growth and team collaboration
4. **Type Safety**: Dedicated types folder for TypeScript definitions
5. **Centralized Exports**: Index files for better import management
6. **Middleware Support**: Dedicated folder for route guards and middleware
7. **Layout System**: Reusable layout components
8. **Service Layer**: Clear separation between API calls and business logic

## Import Aliases

Use `@/` prefix for all imports:
- `@/api/auth` instead of `../actions/auth`
- `@/components/layout/Navbar` instead of `../components/common/Navbar`
- `@/views/DashboardPage` instead of `../pages/DashboardPage`
- `@/stores/auth` instead of `../store/auth`

## Migration Notes

- All imports have been updated to use the new structure
- Router configuration updated to use `@/views/` instead of `../pages/`
- Firebase config moved to `@/config/`
- API layer renamed from `actions` to `api`
- Pages renamed to `views` (industry standard)
- Store renamed to `stores` (plural, industry standard)