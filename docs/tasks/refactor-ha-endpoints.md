# Refactor Home Assistant Endpoints (ha.py)

**Context:**
The `backend/app/api/ha.py` file contains several endpoints and helper functions for Home Assistant integration. There is duplicate code, particularly for vehicle status retrieval, and opportunities for refactoring to improve maintainability and consistency.

**Task:**
Perform the following refactoring and cleanup in `backend/app/api/ha.py`:

1.  **Remove Duplicate Endpoint:** Remove the older, duplicate `router.get("/status/{vehicle_id}")` endpoint. The more complete `router.get("/ha/status/{vehicle_id}")` should be retained.
2.  **Refactor `unpack_vehicle`:** Integrate the logic of the `unpack_vehicle` function directly into the `get_vehicles` endpoint. The `unpack_vehicle` function itself should then be removed. Ensure correct logging messages are used.
3.  **Improve `_handle_api_error`:** Refine the `_handle_api_error` function to more robustly interpret `APIError` payloads and map them to appropriate HTTP responses. Ensure all relevant error codes and messages are handled.
4.  **Verify `get_all_cached_vehicles`:** Confirm that `get_all_cached_vehicles` is correctly awaited if it is an asynchronous function.
5.  **Add Docstrings:** Add comprehensive docstrings to all functions that are currently missing them, explaining their purpose, arguments, and return values.

**Potential Consequences/Considerations:**
-   **Breaking Changes:** Removing the `/status/{vehicle_id}` endpoint will be a breaking change for any Home Assistant installations or other clients still using this older path. This will require clear communication to users.
-   **Testing:** Thorough testing will be required to ensure that all Home Assistant integrations continue to function correctly after the changes, especially for vehicle status and vehicle listing.
-   **Performance:** The refactoring should aim to maintain or improve performance. Integrating `unpack_vehicle` directly might have minor performance implications, which should be monitored.
-   **Error Handling:** Changes to `_handle_api_error` must be carefully reviewed to ensure no new error scenarios are introduced or existing ones are mishandled.
-   **Logging:** Ensure all logging messages are consistent and informative after the refactoring.

**Acceptance Criteria:**
-   The duplicate `router.get("/status/{vehicle_id}")` endpoint is removed.
-   The `unpack_vehicle` function is removed, and its logic is correctly integrated into `get_vehicles`.
-   `_handle_api_error` is improved to handle `APIError` payloads more effectively.
-   `get_all_cached_vehicles` is correctly awaited.
-   All functions in `backend/app/api/ha.py` have appropriate docstrings.
-   All existing Home Assistant integrations (status, vehicles, charging) function as expected.
