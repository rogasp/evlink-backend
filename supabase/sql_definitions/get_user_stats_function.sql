CREATE OR REPLACE FUNCTION public.get_user_stats(p_user_id uuid)
RETURNS TABLE (
    total_sessions bigint,
    total_kwh_charged numeric,
    total_minutes_charged numeric,
    average_charge_rate_kwh_per_hour numeric,
    min_start_time timestamp with time zone,
    max_end_time timestamp with time zone,
    unique_vehicles bigint
)
LANGUAGE plpgsql
AS $function_body$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(cs.session_id) AS total_sessions,
        SUM(cs.energy_added_kwh) AS total_kwh_charged,
        SUM(cs.duration_minutes) AS total_minutes_charged,
        CASE
            WHEN SUM(cs.duration_minutes) > 0 THEN SUM(cs.energy_added_kwh) / (SUM(cs.duration_minutes) / 60.0)
            ELSE 0
        END AS average_charge_rate_kwh_per_hour,
        MIN(cs.start_time) AS min_start_time,
        MAX(cs.end_time) AS max_end_time,
        COUNT(DISTINCT cs.vehicle_id) AS unique_vehicles
    FROM
        public.charging_sessions cs
    WHERE
        cs.user_id = p_user_id;
END;
$function_body$;