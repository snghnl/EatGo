import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Colors } from "@/constants/Colors";
import { DateChangeHandler } from "@/types";
import { parseDate } from "@/utils/dateUtils";

interface DateInputProps {
  startDate: string;
  endDate: string;
  onDateChange?: DateChangeHandler;
}

const { width: screenWidth } = Dimensions.get("window");

export const DateInput: React.FC<DateInputProps> = ({
  startDate,
  endDate,
  onDateChange,
}) => {
  // ===== 상수 정의 =====
  const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
  const MONTH_NAMES = [
    "1월",
    "2월",
    "3월",
    "4월",
    "5월",
    "6월",
    "7월",
    "8월",
    "9월",
    "10월",
    "11월",
    "12월",
  ];

  // ===== 상태 관리 =====
  const [currentDate, setCurrentDate] = useState(new Date());
  const [localSelectedDates, setLocalSelectedDates] = useState(new Set());

  // 컴포넌트 초기화 추적
  const isInitializedRef = useRef(false);

  // ===== 유틸리티 함수들 =====
  const formatDate = (year: number, month: number, day: number): string => {
    const yearStr = year.toString().slice(-2);
    const monthStr = String(month + 1).padStart(2, "0");
    const dayStr = String(day).padStart(2, "0");
    return `${yearStr}.${monthStr}.${dayStr}`;
  };

  const formatDateForComparison = (
    year: number,
    month: number,
    day: number,
  ): string => {
    const monthStr = String(month + 1).padStart(2, "0");
    const dayStr = String(day).padStart(2, "0");
    return `${year}-${monthStr}-${dayStr}`;
  };

  // 현재 선택된 날짜들을 배열로 관리
  const getSelectedDates = (): string[] => {
    const dates = [];
    if (startDate) dates.push(startDate);
    if (endDate && endDate !== startDate) dates.push(endDate);
    return dates;
  };

  // ===== 달력 계산 함수들 =====
  const getCalendarData = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startingDay = firstDayOfMonth.getDay();

    const days = [];
    for (let i = 0; i < startingDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    while (days.length % 7 !== 0) days.push(null);

    const today = new Date().getDate();
    const isCurrentMonth =
      new Date().getFullYear() === year && new Date().getMonth() === month;

    return {
      year,
      month,
      days,
      daysInMonth,
      startingDay,
      today,
      isCurrentMonth,
    };
  };

  // ===== 날짜 선택 처리 =====
  const handleDatePress = (day: number | null) => {
    if (day === null) return;

    const { year, month } = getCalendarData();
    const selectedDate = formatDate(year, month, day);
    const currentDates = getSelectedDates();

    // 이미 선택된 날짜를 다시 누르면 취소
    if (currentDates.includes(selectedDate)) {
      const remainingDates = currentDates.filter(
        (date) => date !== selectedDate,
      );

      if (remainingDates.length === 0) {
        // 모든 선택 취소
        onDateChange?.("", "");
      } else {
        // 하나만 남음 - 시작일로 설정
        onDateChange?.(remainingDates[0], "");
      }
      return;
    }

    // 새로운 날짜 선택
    if (currentDates.length === 0) {
      // 첫 번째 날짜 선택
      onDateChange?.(selectedDate, "");
    } else if (currentDates.length === 1) {
      // 두 번째 날짜 선택 - 자동으로 앞뒤 정렬
      const existingDate = currentDates[0];
      const existingDateForComparison = parseDate(existingDate);
      const selectedDateForComparison = parseDate(selectedDate);

      if (selectedDateForComparison < existingDateForComparison) {
        // 선택한 날짜가 더 빠름
        onDateChange?.(selectedDate, existingDate);
      } else {
        // 선택한 날짜가 더 늦음
        onDateChange?.(existingDate, selectedDate);
      }
    } else {
      // 이미 두 날짜가 선택된 상태 - 기존 선택 지우고 새로 시작
      onDateChange?.(selectedDate, "");
    }
  };

  // ===== 네비게이션 핸들러들 =====
  const handlePrevMonth = () => {
    const { year, month } = getCalendarData();
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    const { year, month } = getCalendarData();
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // ===== Effect 관리 =====
  // 초기화 시에만 selectedDates와 동기화
  useEffect(() => {
    if (!isInitializedRef.current) {
      const dates = getSelectedDates();
      setLocalSelectedDates(new Set(dates));
      isInitializedRef.current = true;
    }
  }, [startDate, endDate]);

  // ===== 렌더링 데이터 준비 =====
  const { year, month, days, today, isCurrentMonth } = getCalendarData();
  const selectedDates = getSelectedDates();

  // 두 날짜가 선택된 경우 범위 체크
  const isInRange = (day: number | null): boolean => {
    if (!day || selectedDates.length !== 2) return false;

    const { year, month } = getCalendarData();
    const currentDateForComparison = parseDate(formatDate(year, month, day));
    const startDateForComparison = parseDate(selectedDates[0]);
    const endDateForComparison = parseDate(selectedDates[1]);

    return (
      currentDateForComparison >= startDateForComparison &&
      currentDateForComparison <= endDateForComparison
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.monthTitle}>
          {year}년 {MONTH_NAMES[month]}
        </Text>

        <View style={styles.navigationContainer}>
          <TouchableOpacity onPress={handlePrevMonth} style={styles.navButton}>
            <Text style={styles.navButtonText}>‹</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
            <Text style={styles.navButtonText}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Calendar Container */}
      <View style={styles.calendarContainer}>
        {/* Weekdays */}
        <View style={styles.weekdaysContainer}>
          {WEEKDAYS.map((day, index) => (
            <View key={day} style={styles.weekdayCell}>
              <Text
                style={[
                  styles.weekdayText,
                  index === 0 && styles.sundayText,
                  index === 6 && styles.saturdayText,
                ]}
              >
                {day}
              </Text>
            </View>
          ))}
        </View>

        {/* Days Grid */}
        <View style={styles.daysContainer}>
          {days.map((day, index) => {
            const dateStr = day ? formatDate(year, month, day) : null;
            const isSelected = day !== null && selectedDates.includes(dateStr!);
            const isToday = day !== null && isCurrentMonth && day === today;
            const inRange = isInRange(day) && !isSelected;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayCell,
                  day === null && styles.emptyDayCell,
                  isSelected && styles.selectedDayCell,
                  inRange && styles.rangeDayCell,
                ]}
                onPress={() => handleDatePress(day)}
                disabled={day === null}
                activeOpacity={0.7}
              >
                {day !== null && (
                  <Text
                    style={[
                      styles.dayText,
                      isToday && styles.todayText,
                      isSelected && styles.selectedDayText,
                      inRange && styles.rangeDayText,
                    ]}
                  >
                    {day}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Selected Dates Display 제거 */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  navigationContainer: {
    flexDirection: "row",
    gap: 16,
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.backgroundGray,
    justifyContent: "center",
    alignItems: "center",
  },
  navButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FF4757",
  },
  calendarContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
  },
  weekdaysContainer: {
    flexDirection: "row",
    marginBottom: 8,
  },
  weekdayCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 6,
  },
  weekdayText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  sundayText: {
    color: "#FF4757",
  },
  saturdayText: {
    color: "#3742fa",
  },
  daysContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: `${100 / 7}%`,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 6,
    marginVertical: 1,
    position: "relative",
  },
  emptyDayCell: {
    backgroundColor: "transparent",
  },
  selectedDayCell: {
    backgroundColor: "#FF4757",
    borderRadius: 18,
    zIndex: 2,
  },
  rangeDayCell: {
    backgroundColor: "rgba(255, 71, 87, 0.15)",
    borderRadius: 18,
    zIndex: 1,
  },
  dayText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  todayText: {
    color: "#FF4757",
    fontWeight: "700",
  },
  selectedDayText: {
    color: "white",
    fontWeight: "700",
  },
  rangeDayText: {
    color: "#FF4757",
    fontWeight: "600",
  },
});
