# Define Tier Names as Constants or Enum

**Context:**
Subscription tier names ("free", "basic", "pro") are currently hardcoded strings in `backend/app/api/dependencies.py`.

**Task:**
Refactor the tier name usage to use constants or an Enum for better maintainability, readability, and to prevent typos.

**Acceptance Criteria:**
- A clear and accessible definition (e.g., Python Enum or module-level constants) for tier names is created.
- All occurrences of hardcoded tier strings in `backend/app/api/dependencies.py` are replaced with references to these constants/Enum members.
- The application's logic for handling tiers remains unchanged and functions correctly.
