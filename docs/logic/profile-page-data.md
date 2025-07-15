# Profile Page Data Logic

This document details the origin and logic behind each data point displayed on the user profile page (`@frontend/src/app/(app)/profile/page.tsx`).

## Data Sources

- **`useUserContext` Hook:** Provides core user information, authentication status, and access tokens. This is the primary source for user-specific data.
- **`useBillingInfo` Hook:** Fetches subscription and invoice details, primarily from Stripe via the backend.
- **Backend API Endpoints:** Data is ultimately sourced from the FastAPI backend, which interacts with Supabase and other third-party services (e.g., Stripe, Enode).

## Data Points and Their Logic

### User Information (from `useUserContext`)

- **User Name (`mergedUser.name`):**
  - **Origin:** `mergedUser` object from `useUserContext`.
  - **Logic:** Represents the user's display name. Typically sourced from the authentication provider (e.g., GitHub, Google) or set by the user.

- **User Email (`user.email`):**
  - **Origin:** `user` object from `useUserContext`.
  - **Logic:** The user's primary email address, used for login and notifications. Displayed as a `mailto:` link.

- **User ID (`user.id`):**
  - **Origin:** `user` object from `useUserContext`.
  - **Logic:** Unique identifier for the user in the system. Displayed for debugging/support purposes.

- **Tier (`mergedUser.tier`):**
  - **Origin:** `mergedUser` object from `useUserContext`.
  - **Logic:** Represents the user's current subscription tier (e.g., 'FREE', 'BASIC', 'PRO'). Determines available features and API limits. Displayed in uppercase.

- **SMS Credits (`mergedUser.sms_credits`):**
  - **Origin:** `mergedUser` object from `useUserContext`.
  - **Logic:** The number of remaining SMS credits for notifications. Managed by the backend based on purchases or tier benefits.

- **Purchased API Tokens (`mergedUser.purchased_api_tokens`):**
  - **Origin:** `mergedUser` object from `useUserContext`.
  - **Logic:** Additional API calls purchased beyond the monthly allowance. Decremented with each API call when monthly allowance is exceeded.

- **Notification Status (`notifyOffline` state, controlled by `handleToggleNotify`):**
  - **Origin:** Initial value from `mergedUser.notify_offline` (from `useUserContext`). Updated via `PATCH /user/{userId}/notify` API call.
  - **Logic:** Boolean indicating if the user wishes to receive email notifications when their vehicle goes offline. Only available for paying users.

- **Newsletter Status (`isSubscribed` state, controlled by `handleToggleNewsletter`):**
  - **Origin:** Initial value fetched from `/newsletter/manage/status` API. Updated via `POST /newsletter/manage/subscribe` or `/newsletter/manage/unsubscribe` API calls.
  - **Logic:** Boolean indicating if the user is subscribed to the project newsletter.

- **API Usage Stats (`apiUsage` state in `UserInfoCard`):**
  - **Origin:** Fetched directly within `UserInfoCard` from `/me/api-usage` API endpoint.
  - **Logic:** Displays current API calls vs. maximum allowed calls per month, and linked vehicles vs. maximum linked vehicles. This data is specific to the user's API consumption.

### API Key Information (from `ApiKeySection`)

- **API Key (`apiKey` state):**
  - **Origin:** Fetched from `/users/{userId}/apikey` API endpoint. Masked by default. The full key is only shown immediately after generation.
  - **Logic:** A unique key used to authenticate Home Assistant integration. Can be regenerated, which deactivates the old key.

### Home Assistant Webhook Settings (from `HaWebhookSettingsCard`)

- **Webhook URL (`webhookUrl` state):**
  - **Origin:** Fetched from `/user/{userId}/webhook` API endpoint.
  - **Logic:** The URL configured in Home Assistant to receive real-time updates from EVLink. Saved on blur.

- **Webhook ID (`webhookId` state):**
  - **Origin:** Fetched from `/user/{userId}/webhook` API endpoint.
  - **Logic:** The unique ID for the Home Assistant webhook. Saved on blur.

### Billing Information (from `useBillingInfo` and `BillingCard`)

- **Subscription Plan (`subscriptionPlan` prop):**
  - **Origin:** `subscription?.plan_name` from `useBillingInfo`.
  - **Logic:** The name of the user's current Stripe subscription plan (e.g., 'Free', 'Basic', 'Pro').

- **Price (`price` prop):**
  - **Origin:** Calculated from `subscription.amount` and `subscription.currency` from `useBillingInfo`.
  - **Logic:** The monthly price of the current subscription plan. Formatted to two decimal places with currency code.

- **Next Billing Date (`nextBillingDate` prop):**
  - **Origin:** `subscription?.current_period_end` from `useBillingInfo`.
  - **Logic:** The date when the next subscription payment is due. Formatted as a local date string.

- **Current Period Start/End (`current_period_start`, `current_period_end` props):**
  - **Origin:** `subscription?.current_period_start` and `subscription?.current_period_end` from `useBillingInfo`.
  - **Logic:** The start and end dates of the current billing cycle. Formatted as local date strings.

- **Invoices (`invoices` prop):**
  - **Origin:** `invoices` array from `useBillingInfo`.
  - **Logic:** A list of past invoices, including receipt number, date, amount, status, and links to PDF/hosted invoice URLs.

---