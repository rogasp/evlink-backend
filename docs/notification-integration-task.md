# Notification Service Integration Task

## Security-First Implementation Plan
**Branch**: `feature/notification-integration-existing-schema`  
**Status**: Planning Phase  
**Last Updated**: 2025-07-24  

## Security Requirements (Non-Negotiable)
- **User Authentication**: All endpoints require valid JWT token
- **User Isolation**: Users can only access/modify their own data
- **Data Validation**: All inputs validated server-side
- **Rate Limiting**: SMS verification and preference updates rate-limited
- **Audit Logging**: Track all preference changes and verification attempts

## Current State Analysis
✅ **Database Ready**: notification_preferences JSONB column exists  
✅ **Email Service**: EmailService and BrevoEmailService available  
✅ **Basic Auth**: JWT authentication already implemented  
⚠️ **API Endpoints**: Missing notification preference endpoints  
⚠️ **Frontend**: Using legacy notify_offline boolean  

## Implementation Tasks (Security-First)

### Phase 1: Backend Security Foundation
- [ ] **Create secure API endpoints with user isolation**
  - [ ] `GET /api/v1/user/notification-preferences` - return only user's preferences
  - [ ] `PUT /api/v1/user/notification-preferences` - update only user's preferences
  - [ ] `POST /api/v1/user/phone/verify` - rate-limited SMS verification
  - [ ] `POST /api/v1/user/phone/confirm` - validate verification code

- [ ] **Storage Layer Security**
  - [ ] `get_notification_preferences(user_id)` - enforce user isolation
  - [ ] `update_notification_preferences(user_id, preferences)` - validate input
  - [ ] `initiate_phone_verification(user_id, phone)` - rate limiting
  - [ ] `confirm_phone_verification(user_id, code)` - secure validation

### Phase 2: Frontend Security
- [ ] **Secure API Client Updates**
  - [ ] Add notification preferences endpoints to authFetch
  - [ ] Implement client-side rate limiting for SMS
  - [ ] Add CSRF protection for preference updates

- [ ] **User Interface Security**
  - [ ] Disable SMS options for unverified users
  - [ ] Hide phone verification for already verified numbers
  - [ ] Validate phone number format client-side before API calls

### Phase 3: Legacy Migration Security
- [ ] **Secure Migration Path**
  - [ ] Update `/me` endpoint to include notification_preferences (user-isolated)
  - [ ] Deprecate `PATCH /user/{user_id}/notify` endpoint safely
  - [ ] Ensure backward compatibility during transition

### Phase 4: Authorization Layers
- [ ] **Route-level authentication**
  - [ ] All notification endpoints require authenticated user
  - [ ] Admin endpoints properly isolated

- [ ] **Data-level authorization**
  - [ ] Storage functions validate user_id matches authenticated user
  - [ ] Database queries include user_id filters (RLS + application-level)

## Security Checklist Per Task

### API Endpoints Security
```typescript
// Required for each endpoint
- JWT token validation
- User ID extraction from token
- User ID matching with requested data
- Input validation (schemas)
- Rate limiting
- Error handling (no data leakage)
```

### Storage Functions Security
```typescript
// Required for each storage function
- User ID parameter validation
- RLS policy enforcement
- Input sanitization
- Rate limiting for SMS
- Audit logging
```

### Frontend Security
```typescript
// Required for each component
- Token management
- User ID matching
- Input validation
- Rate limiting guards
- Error handling
```

## Security Testing Requirements

### Backend Security Tests
- [ ] Test unauthorized access to endpoints
- [ ] Test cross-user data access attempts
- [ ] Test rate limiting effectiveness
- [ ] Test input validation against injection attacks
- [ ] Test phone number format validation

### Frontend Security Tests
- [ ] Test authenticated-only access to settings
- [ ] Test user isolation in API calls
- [ ] Test rate limiting behavior
- [ ] Test error handling without data exposure

## Security Documentation

### Security Model
```
User (JWT) → API Endpoint → Storage Layer → Database (RLS)
     ↓           ↓              ↓              ↓
Validation → Authorization → Isolation → Enforcement
```

### Security Guarantees
- **User Isolation**: Each user can only see/modify their own notification preferences
- **Data Integrity**: All preferences updates validated against schema
- **Rate Protection**: SMS verification limited to prevent abuse
- **Audit Trail**: All preference changes logged with user ID and timestamp

## Progress Tracking

### Completed ✅
- [x] Branch creation: feature/notification-integration-existing-schema
- [x] Security analysis completed
- [x] Task documentation created

### In Progress 🔄
- [ ] Backend API endpoint security implementation
- [ ] Frontend security layer updates

### Next Steps 📋
- [ ] Create secure storage functions
- [ ] Implement rate limiting
- [ ] Add comprehensive input validation
- [ ] Create audit logging

## Security Review Checklist

Before each commit:
- [ ] All endpoints include user isolation
- [ ] All storage functions validate user ownership
- [ ] All inputs are validated server-side
- [ ] All API responses exclude other users' data
- [ ] Rate limiting is properly configured
- [ ] Error messages don't leak sensitive information

## Emergency Rollback Plan
If security issues are discovered:
1. Immediately disable affected endpoints
2. Create GitHub issue with security details
3. Roll back to previous secure commit
4. Document security vulnerability and fix