import React, { useState, useMemo } from "react";
import { StyleSheet, View, Text, ScrollView } from "react-native";
import { DestinationChangeHandler } from "@/types";
import { DestinationButton } from "./DestinationButton";
import { useProvinces } from "@/hooks/useProvinces";
import { useDistricts } from "@/hooks/useDistricts";

type SelectionStep = "province" | "district";

interface DestinationSelectorProps {
  onDestinationChange?: DestinationChangeHandler;
}

export const DestinationSelector: React.FC<DestinationSelectorProps> = ({
  onDestinationChange,
}) => {
  const [step, setStep] = useState<SelectionStep>("province");
  const [selectedProvinceName, setSelectedProvinceName] = useState<
    string | null
  >(null);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);

  const {
    data: provinces,
    loading: provincesLoading,
    error: provincesError,
  } = useProvinces();
  const {
    data: districts,
    loading: districtsLoading,
    error: districtsError,
  } = useDistricts({
    provinceName: selectedProvinceName || undefined,
    enabled: step === "district" && !!selectedProvinceName,
  });

  const handleProvincePress = (provinceName: string) => {
    setSelectedProvinceName(provinceName);
    setStep("district");
    setSelectedDistricts([]);
    onDestinationChange?.([]);
  };

  const handleDistrictPress = (districtName: string) => {
    const fullDestinationName = `${selectedProvinceName} ${districtName}`;
    const newSelected = selectedDistricts.includes(fullDestinationName)
      ? selectedDistricts.filter((d) => d !== fullDestinationName)
      : [...selectedDistricts, fullDestinationName];

    setSelectedDistricts(newSelected);
    onDestinationChange?.(newSelected);
  };

  const handleBackToProvinces = () => {
    setStep("province");
    setSelectedProvinceName(null);
    setSelectedDistricts([]);
    onDestinationChange?.([]);
  };

  const currentItems = useMemo(() => {
    if (step === "province") {
      return provinces?.filter((p) => p.is_active)?.map((p) => p.name) || [];
    } else {
      return districts?.filter((d) => d.is_active)?.map((d) => d.name) || [];
    }
  }, [step, provinces, districts]);

  const selectedItems =
    step === "province"
      ? selectedProvinceName
        ? [selectedProvinceName]
        : []
      : selectedDistricts;

  const createRows = (items: string[]) => {
    const rows = [];
    for (let i = 0; i < items.length; i += 4) {
      const rowItems = items.slice(i, i + 4);
      rows.push(rowItems);
    }
    return rows;
  };

  const rows = createRows(currentItems);
  const loading = provincesLoading || (step === "district" && districtsLoading);

  return (
    <View style={styles.container}>
      {step === "district" && (
        <View style={styles.header}>
          <Text style={styles.backButton} onPress={handleBackToProvinces}>
            ← 다시 선택하기
          </Text>
          <Text style={styles.stepTitle}>{selectedProvinceName}</Text>
        </View>
      )}

      {loading ? (
        <Text style={styles.loading}>Loading...</Text>
      ) : provincesError || districtsError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {provincesError || districtsError}
          </Text>
          <Text
            style={styles.retryButton}
            onPress={() => {
              if (provincesError && step === "province") {
                // Retry provinces
              } else if (districtsError && step === "district") {
                // Retry districts
              }
            }}
          >
            Retry
          </Text>
        </View>
      ) : currentItems.length === 0 ? (
        <Text style={styles.noDataText}>
          {step === "province"
            ? "No provinces available"
            : "No districts available"}
        </Text>
      ) : (
        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {rows.map((row, rowIndex) => (
            <View
              key={rowIndex}
              style={[styles.row, row.length < 4 && styles.lastRow]}
            >
              {row.map((item, index) => (
                <DestinationButton
                  key={`${rowIndex}-${index}`}
                  destination={item}
                  isSelected={
                    step === "province"
                      ? selectedItems.includes(item)
                      : selectedDistricts.some((d) => d.endsWith(` ${item}`))
                  }
                  onPress={
                    step === "province"
                      ? handleProvincePress
                      : handleDistrictPress
                  }
                />
              ))}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    marginTop: 20,
  },
  header: {
    marginBottom: 16,
  },
  backButton: {
    fontSize: 16,
    color: "#007AFF",
    marginBottom: 8,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  loading: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginVertical: 20,
  },
  errorContainer: {
    padding: 16,
    alignItems: "center",
  },
  errorText: {
    fontSize: 14,
    color: "#FF3B30",
    textAlign: "center",
    marginBottom: 8,
  },
  retryButton: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "600",
  },
  noDataText: {
    fontSize: 14,
    textAlign: "center",
    color: "#666",
    marginVertical: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  lastRow: {
    justifyContent: "center",
    gap: 8,
  },
  scrollContainer: {
    maxHeight: 200,
    marginBottom: 20,
  },
  scrollContent: {
    paddingBottom: 10,
  },
});
