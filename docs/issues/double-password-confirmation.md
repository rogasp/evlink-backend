# 🔐 Double password confirmation during registration

**Labels:** `enhancement`, `backlog`, `auth`

When a user registers, they should be required to enter their password twice to avoid accidental typos, as the password field is masked.

**Acceptance criteria:**
- Two password fields: `password` and `confirm_password`
- Form should validate that both fields match before submission
