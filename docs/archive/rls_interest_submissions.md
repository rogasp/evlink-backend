# RLS Policy: interest

## Table: interest

### RLS: Enabled ✅

### Policies

#### ✅ INSERT
- **Who**: `authenticated`
- **Condition**: Always true
- **With Check**: Always true
- **Purpose**: Allow any logged-in user to submit interest

#### ✅ SELECT / UPDATE / DELETE
- **Who**: `admin`, `service`
- **Condition**: `auth.jwt() ->> 'role' IN ('admin', 'service')`
- **Purpose**: Prevent users from reading or deleting interest data
