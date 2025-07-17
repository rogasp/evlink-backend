-- Step 1: Reset linked_vehicle_count for all users
-- This ensures that users who have no vehicles get a count of 0.
UPDATE public.users
SET linked_vehicle_count = 0;

-- Step 2: Update linked_vehicle_count based on actual vehicles
-- Counts the number of vehicles per user in public.vehicles and then updates public.users.
UPDATE public.users AS u
SET linked_vehicle_count = v.vehicle_count
FROM (
    SELECT user_id, COUNT(*) AS vehicle_count
    FROM public.vehicles
    GROUP BY user_id
) AS v
WHERE u.id = v.user_id;
