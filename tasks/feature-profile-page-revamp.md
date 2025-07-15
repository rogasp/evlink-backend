# Feature: Profile Page Revamp

**Objective:** To refactor and enhance the user profile page (`@frontend/src/app/(app)/profile/page.tsx`) by improving UI/UX, verifying data accuracy, ensuring a clean component architecture, and creating comprehensive documentation.

---

## Phase 1: Git Setup & Branching

- [x] **Fetch latest changes:** Run `git fetch origin`.
- [x] **Sync `staging` with `main`:**
    - [x] Compare `origin/main` and `origin/staging`.
    - [x] If they differ, merge `origin/main` into local `staging` branch. *(Skipped, not needed)*
    - [x] Push the updated `staging` branch to origin. *(Skipped, not needed)*
- [x] **Create feature branch:** Create and switch to a new branch named `feature/profile-page-revamp` from the updated `staging` branch.

---

## Phase 2: Component & Code Structure Review

- [x] **Verify Data Context:** Ensure that `profile/page.tsx` and all its child components exclusively use `useUserContext` for user-related data, removing any legacy data-fetching logic.
- [x] **Analyze Component Structure:** Review `profile/page.tsx` and its child components (`UserInfoCard`, `ApiKeySection`, etc.). Identify any parts that can be broken down into smaller, reusable sub-components.
- [x] **Align with Guidelines:** Ensure all profile-related components are located in the correct directories as per the project's architectural guidelines. I will consult `@tasks/document_component_structure.md` for this.
- [x] **Document Component Architecture:** Update `@docs/ARCHITECTURE.md` with a new section describing the frontend component philosophy, using the profile page components as a primary example.

---

## Phase 3: UI/UX Enhancements

- [x] **Global:** Add `cursor-pointer` style to all interactive elements.

- [x] **UserInfoCard (`UserInfoCard.tsx`):**
    - [x] Display `user.id` under the user's name with `muted` text styling.
    - [x] Add a `Tooltip` with a `(?)` icon next to the "Tier", "SMS Credits", and "Purchased API Tokens" labels.

- [x] **ApiKeySection (`ApiKeySection.tsx`):**
    - [x] Add a `Tooltip` for the "API Key" input, "Copy" button, and "Generate New Key" button.

- [x] **HaWebhookSettingsCard (`HaWebhookSettingsCard.tsx`):**
    - [x] Add a `Tooltip` for the "Webhook URL", "Webhook Secret", and "Save" button.

- [x] **BillingCard (`BillingCard.tsx`):**
    - [x] Add a `Tooltip` for "Subscription Plan", "Price", "Next Billing Date", and the "Manage Subscription" button.

---

## Phase 4: Data Verification & Documentation

- [x] **Analyze Data Flow:** Thoroughly review the `useUserContext` and `useBillingInfo` hooks to confirm the origin of all data.
- [x] **Create Documentation File:** Create a new file at `docs/logic/profile-page-data.md`.
- [x] **Document Data Points:** In the new file, document the source, logic, and purpose for every field displayed on the profile page.

---

## Phase 5: Finalization

- [x] **Code Quality:** Run `npm run lint -- --fix` in the `frontend` directory.
- [x] **Final Review:** Go through all checklist items to confirm completion.
- [x] **Mark as Complete:** Update this task file.

---

## Definition of Done (DOD)

- [x] All checkboxes in this document are marked as complete (`[x]`).
- [x] All code changes exist on the `feature/profile-page-revamp` branch.
- [x] All specified UI/UX enhancements are implemented.
- [x] The component structure has been reviewed and refactored as needed.
- [x] `@docs/ARCHITECTURE.md` is updated with component structure documentation.
- [x] The new documentation file `docs/logic/profile-page-data.md` is created and populated.
- [x] The frontend application builds successfully and passes all linting checks.

---

## Notes & Deviations

*(This section will be updated if we deviate from the plan or discover new requirements.)*
