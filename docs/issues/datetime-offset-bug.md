# 🐛 Datetime parsing error: can't subtract offset-naive and offset-aware datetimes

**Labels:** `bug`, `backlog`, `cache`

## Description

The system fails to parse `updated_at` values properly when comparing webhook timestamps, due to a mismatch between offset-naive and offset-aware datetime objects.

## Log excerpt

```
[⚠️ cache] Failed to parse updated_at: can't subtract offset-naive and offset-aware datetimes
⚠️ Webhook-data för 2f848142-3436-4489-8a9e-e4225e132646 är äldre – cache uppdateras ej.
```

This leads to legitimate webhook data being discarded even when valid.

## Suggested Fix

- Ensure that all datetime objects used in comparisons are either:
  - consistently timezone-aware (`datetime.fromisoformat(...).astimezone()`), or
  - explicitly made naive if operating in local context.

- Add a unit test for comparing webhook `updated_at` with current cache timestamps.

- Consider logging which datetime format is received and parsed in debug mode.
