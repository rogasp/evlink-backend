create view public.global_stats_view as
select
  count(distinct cs.user_id) as unique_users,
  count(distinct cs.vehicle_id) as unique_vehicles,
  count(cs.session_id) as total_sessions,
  sum(cs.energy_added_kwh) as total_kwh_charged,
  sum(cs.duration_minutes) as total_minutes_charged,
  case
    when sum(cs.duration_minutes) > 0::numeric then sum(cs.energy_added_kwh) / (sum(cs.duration_minutes) / 60.0)
    else 0::numeric
  end as average_charge_rate_kwh_per_hour,
  max(cs.max_charge_rate_kw) as highest_max_charge_rate_kw,
  max(cs.average_charge_rate_kw) as highest_average_charge_rate_kw,
  min(cs.start_time) as min_start_time,
  max(cs.end_time) as max_end_time
from
  charging_sessions cs;