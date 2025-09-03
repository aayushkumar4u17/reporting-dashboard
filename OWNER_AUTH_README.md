# Owner-Based Authentication Implementation

This document describes the implementation of owner-based authentication for the FuelBuddy Reporting Dashboard.

## Overview

The reporting dashboard now restricts access to only users who are marked as owners (`is_owner = true`) in the `organization_user` table. This ensures that only organization owners can access sensitive reporting data.

## Implementation Details

### Backend Integration

**GraphQL Query**: Direct database query through Hasura GraphQL endpoint
- **File**: `src/graphql/auth/checkUserOwnerStatus.graphql`
- **Endpoint**: `https://graphql.fuelbuddy.in/v1/graphql` (GraphQL)
- **Purpose**: Queries the `organization_user` table directly to verify if a user is an owner
- **Authentication**: Uses Firebase JWT tokens (following customer dashboard pattern)

**Query Logic**:
```graphql
query checkUserOwnerStatus($user_id: uuid!) {
  organization_user(
    where: {
      user_id: { _eq: $user_id }
      is_owner: { _eq: true }
      is_active: { _eq: true }
    }
  ) {
    id
    is_owner
    organization_id
    organization {
      id
      name
    }
  }
}
```

### Frontend Changes

**Authentication Flow**:
1. User enters phone number and receives OTP
2. After OTP verification, system extracts `x-hasura-user-id` from Firebase token
3. System calls `checkUserOwnerStatus` API with the user ID
4. If user is not an owner, access is denied with appropriate error message
5. If user is an owner, access is granted and login state is set

**Error Handling**:
- **ErrorNotification Component**: User-friendly error dialogs
- **useErrorHandler Composable**: Centralized error management
- **Predefined Error Types**:
  - Owner Access Error
  - Authentication Error
  - Network Error
  - Token Error

## Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# GraphQL Configuration (Following Customer Dashboard Pattern)
VITE_GRAPHQL_SCHEMA_PATH=https://graphql.fuelbuddy.in/v1/graphql
VITE_GRAPHQL_WS_SCHEMA_PATH=wss://graphql.fuelbuddy.in/v1/graphql

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
# ... other Firebase config
```

## Testing

### Test Scenarios

#### 1. Owner User Test
**Setup**:
- Ensure test user exists in `organization_user` table with `is_owner = true`
- User should have valid Firebase authentication

**Expected Result**:
- User can successfully log in
- Dashboard access is granted
- No error messages displayed

#### 2. Non-Owner User Test
**Setup**:
- Ensure test user exists in `organization_user` table with `is_owner = false`
- User should have valid Firebase authentication

**Expected Result**:
- User receives OTP successfully
- After OTP verification, access is denied
- Error message: "Only organization owners can access the reporting dashboard"
- User is logged out automatically

#### 3. User Not in Organization Test
**Setup**:
- Test user has Firebase authentication but no entry in `organization_user` table

**Expected Result**:
- User receives OTP successfully
- After OTP verification, access is denied
- Error message: "Only organization owners can access the reporting dashboard"
- User is logged out automatically

#### 4. Network Error Test
**Setup**:
- Simulate network failure or API unavailability

**Expected Result**:
- User receives appropriate network error message
- Retry option is available
- User is logged out for security

### Manual Testing Steps

1. **Start the application**:
   ```bash
   npm run dev
   ```

2. **Test Owner Access**:
   - Navigate to `/login`
   - Enter phone number of a user with `is_owner = true`
   - Complete OTP verification
   - Verify successful login and dashboard access

3. **Test Non-Owner Access**:
   - Clear browser storage
   - Navigate to `/login`
   - Enter phone number of a user with `is_owner = false`
   - Complete OTP verification
   - Verify access denial with appropriate error message

4. **Test Invalid User**:
   - Clear browser storage
   - Navigate to `/login`
   - Enter phone number of a user not in `organization_user` table
   - Complete OTP verification
   - Verify access denial

### Database Verification

To verify user owner status in the database:

```sql
SELECT 
    ou.id,
    ou.user_id,
    ou.organization_id,
    ou.is_owner,
    ou.is_active,
    u.phone_number,
    o.name as organization_name
FROM organization_user ou
JOIN "user" u ON ou.user_id = u.id
JOIN organization o ON ou.organization_id = o.id
WHERE u.phone_number = '+91XXXXXXXXXX';
```

## Security Considerations

1. **Token Validation**: All requests validate Firebase JWT tokens
2. **Admin Secret**: Backend API calls use Hasura admin secret
3. **Session Management**: Failed authentication clears all session data
4. **Error Information**: Error messages don't expose sensitive system details

## Troubleshooting

### Common Issues

1. **"User ID not found in token"**
   - Check Firebase custom claims configuration
   - Verify Hasura JWT claims are properly set

2. **"Failed to check owner status"**
   - Verify `VITE_GRAPHQL_SCHEMA_PATH` is correct
   - Check Firebase JWT token is valid
   - Ensure Hasura GraphQL endpoint is accessible

3. **"Network Error"**
   - Check internet connectivity
   - Verify API endpoints are accessible
   - Check CORS configuration

### Debug Mode

Enable debug logging by checking browser console for:
- `Checking owner status for user: [user_id]`
- `Owner status check response: [response]`
- `User verified as owner, granting access`

## Files Modified

### GraphQL Integration
- `src/graphql/auth/checkUserOwnerStatus.graphql` (new)
- `src/actions/GraphQLClient.js` (new)
- `src/actions/GraphQLAuth.js` (new)

### Frontend
- `src/actions/general.js`
- `src/firebase/index.js`
- `src/pages/LoginPage.vue`
- `src/components/ErrorNotification.vue` (existing)
- `src/composables/useErrorHandler.js` (existing)
- `src/App.vue` (existing)
- `.env.example` (new)
- `OWNER_AUTH_README.md` (updated)

This implementation ensures that only authorized organization owners can access the reporting dashboard while providing clear feedback to unauthorized users.