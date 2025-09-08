import { useCallback, useEffect, useState } from "react";
import { Districts } from "@/src/client/sdk.gen";
import type { DistrictList } from "@/src/client/types.gen";

export type UseDistrictsParams = {
  provinceName?: string;
  enabled?: boolean;
};

export function useDistricts(params: UseDistrictsParams = {}) {
  const { provinceName, enabled = true } = params;
  const [allDistricts, setAllDistricts] = useState<DistrictList[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canFetch = enabled;

  const fetchDistricts = useCallback(async () => {
    if (!canFetch) {
      setAllDistricts(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await Districts.districtsList();
      setAllDistricts(result.data || []);
    } catch (e: any) {
      setError(e?.message || "Failed to fetch districts");
    } finally {
      setLoading(false);
    }
  }, [canFetch]);

  useEffect(() => {
    fetchDistricts();
  }, [fetchDistricts]);

  // Filter districts by province name
  const data =
    provinceName && allDistricts
      ? allDistricts.filter(
          (district) => district.province_name === provinceName,
        )
      : [];

  return { data, loading, error, refetch: fetchDistricts };
}
