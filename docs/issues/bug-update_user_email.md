# 🔧 Exception in `update_user_email` when calling `POST /users/{user_id}/email`

**Labels:** `bug`, `backlog`

## Description

We are encountering a `500 Internal Server Error` when calling the endpoint:

    POST /backend/api/users/{user_id}/email

The traceback shows that the error occurs in the `update_user_email()` function, specifically on this line:

    vehicle_id = vehicle.get("id")

It seems that `vehicle` is either `None` or not a dictionary at this point.

## Excerpt from log

    File "/backend/app/storage.py", line 314, in update_user_email
        vehicle_id = vehicle.get("id")
    AttributeError: 'NoneType' object has no attribute 'get'

## Steps to Reproduce (if known)

1. Call `POST /backend/api/users/{user_id}/email` with a valid UUID and email payload.  
2. Observe server returns 500.  
3. Error traced to vehicle-related code inside `update_user_email`.

## Suggested Follow-up

- Add a check that `vehicle` is not `None` before accessing `.get("id")`.  
- Consider logging the context (`user_id`, DB result) when this occurs.  
- Write a regression test to confirm fix.
