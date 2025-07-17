-- Steg 1: Nollställ linked_vehicle_count för alla användare
-- Detta säkerställer att användare som inte har några fordon får 0.
UPDATE public.users
SET linked_vehicle_count = 0;

-- Steg 2: Uppdatera linked_vehicle_count baserat på faktiska fordon
-- Räknar antalet fordon per användare i public.vehicles och uppdaterar sedan public.users.
UPDATE public.users AS u
SET linked_vehicle_count = v.vehicle_count
FROM (
    SELECT user_id, COUNT(*) AS vehicle_count
    FROM public.vehicles
    GROUP BY user_id
) AS v
WHERE u.id = v.user_id;
