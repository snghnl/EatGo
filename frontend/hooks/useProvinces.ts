import { useCallback, useEffect, useState } from "react";
import { Provinces } from "@/src/client/sdk.gen";
import type { Province } from "@/src/client/types.gen";

export function useProvinces(enabled = true) {
  const [data, setData] = useState<Province[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProvinces = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const result = await Provinces.provincesList();
      console.log("Provinces API response:", result);
      setData(result.data || []);
    } catch (e: any) {
      console.error("Provinces API error:", e);
      setError(e?.message || "Failed to fetch provinces");
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchProvinces();
  }, [fetchProvinces]);

  return { data, loading, error, refetch: fetchProvinces };
}
