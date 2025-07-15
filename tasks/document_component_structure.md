# Task: Document Frontend Component Structure Guidelines

**Status:** Not Started
**Priority:** Medium
**Effort:** Low

## Problem Description

To ensure consistency, readability, and maintainability across the frontend codebase, clear guidelines for component naming, folder structure, and modular design are needed. These guidelines will serve as a reference for current and future developers working on the project.

## Acceptance Criteria

1.  Create a new section in `GEMINI.md` (or a dedicated `frontend_guidelines.md` if preferred) outlining the agreed-upon component structure.
2.  The documentation should cover:
    -   **Component Naming Convention:** `PascalCase` for file and component names, avoiding `index.tsx` unless necessary.
    -   **Folder Structure:**
        -   `frontend/src/components/ui/`: For generic, reusable UI building blocks (e.g., ShadCN components).
        -   `frontend/src/components/shared/`: For application-specific, general-purpose reusable UI components.
        -   `frontend/src/components/layout/`: For components defining overall page structure/layout.
        -   `frontend/src/components/feature-name/`: For components specific to a feature or domain, with subdirectories for complex features.
        -   Page-specific components: Components used by only one `page.tsx` can reside in a `components/` subdirectory within the page's route segment.
    -   **Modular and Reusable Design Principles:**
        -   Components should be small and focused.
        -   Primarily props-driven.
        -   Avoid deep nesting within a single file.
        -   Awareness of Client vs. Server Components.
    -   **Linting and TypeScript:** Emphasize strict adherence to linting rules and TypeScript typing.
3.  Ensure the documentation is clear, concise, and easy to understand.

## Implementation Notes

-   Review existing `GEMINI.md` for appropriate placement or consider creating a new dedicated file.
-   Coordinate with stakeholders if there are existing, undocumented conventions.