### Problem Description

The "Linked Vehicles" display on the user profile page (`/profile`) incorrectly shows `0` linked vehicles, even when the user has one or more vehicles linked. This is observed for users who should have at least one linked vehicle.

This issue affects the accuracy of information presented to the user regarding their account's vehicle usage.

### Observed Behavior

- **Expected:** If a user has 1 linked vehicle, the display should show `1 / [max_linked_vehicles]`.
- **Actual:** The display shows `0 / [max_linked_vehicles]`.

### Relevant Code/Data Flow

- The data for "Linked Vehicles" comes from the `apiUsage.linked_vehicle_count` property within the `UserInfoCard` component.
- This `apiUsage` data is fetched from the backend endpoint `/me/api-usage`.
- The `apiUsage.linked_vehicle_count` is expected to reflect the actual number of vehicles linked to the user's account.

### Suspected Cause

- The backend endpoint `/me/api-usage` might be returning an incorrect `linked_vehicle_count` (always 0).
- There might be an issue with how `linked_vehicle_count` is calculated or stored in the backend/database.

### Acceptance Criteria

- The "Linked Vehicles" display on the profile page accurately reflects the number of vehicles linked to the user's account.
- The backend endpoint `/me/api-usage` returns the correct `linked_vehicle_count`.

### Labels

`bug`, `backend`, `frontend`, `api`, `priority: high`
