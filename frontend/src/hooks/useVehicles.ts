import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Vehicle } from "@/types/vehicle";

interface UseVehiclesResult {
  vehicles: Vehicle[];
  loading: boolean;
  error: string | null;
}

export function useVehicles(userId?: string): UseVehiclesResult {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setVehicles([]);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);

    const fetchVehicles = async () => {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .eq("user_id", userId);

      if (error) {
        setError(error.message);
        setVehicles([]);
      } else {
        setVehicles(data ?? []);
        setError(null);
      }
      setLoading(false);
    };

    fetchVehicles();
  }, [userId]);

  return { vehicles, loading, error };
}
