# Refactor: Remove _get_setting_value function

**Context:**
The `_get_setting_value` function in `backend/app/api/dependencies.py` is a temporary solution.

**Task:**
Remove the `_get_setting_value` function once `pydantic-settings` is fully implemented and integrated for dynamic setting retrieval. Ensure all calls to `_get_setting_value` are replaced with the new pydantic-settings approach.

**Acceptance Criteria:**
- `_get_setting_value` function is removed from `backend/app/api/dependencies.py`.
- All usages of `_get_setting_value` are updated to use `pydantic-settings`.
- The application functions correctly after the change.
