// app/plan/index.tsx
import React, { useState, useEffect } from "react";
import { StyleSheet, View, SafeAreaView } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { CourseList } from "@/components/plan"; // ✅ CourseListExample → CourseList
import Header from "@/components/common/Header";
import ActionButtons from "@/components/common/ActionButtons";
import { CreateCourseModal } from "@/components/common";
import { Colors } from "@/constants/Colors";
import { TravelCourses } from "@/src/client/sdk.gen";
import { TravelCourse } from "@/src/client/types.gen";

// 새 코스 정보 인터페이스
export default function PlanListScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [newCourse, setNewCourse] = useState<TravelCourse | null>(null);
  const [courses, setCourses] = useState<TravelCourse[]>([]);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCourse, setEditingCourse] = useState<TravelCourse | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);

  // plan 페이지에 포커스가 돌아올 때 모달 상태 초기화
  useFocusEffect(
    React.useCallback(() => {
      setModalVisible(false);
      setNewCourse(null);
    }, []),
  );

  // 여행 코스 목록 조회
  useEffect(() => {
    TravelCourses.travelCoursesMyList()
      .then((res) => {
        setCourses(res.data || []);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  const handleAddCourse = () => {
    setModalVisible(true);
  };

  const handleDelete = async () => {
    if (!isDeleteMode) {
      // 삭제 모드 시작
      setIsDeleteMode(true);
      setSelectedCourseIds([]);
    } else {
      // 선택된 코스들 삭제
      if (selectedCourseIds.length === 0) {
        setIsDeleteMode(false);
        return;
      }

      try {
        // API 호출로 삭제
        await Promise.all(
          selectedCourseIds.map((courseId) =>
            TravelCourses.travelCoursesDelete({ path: { id: courseId } })
          )
        );

        // 로컬 상태에서 삭제
        setCourses((prev) =>
          prev.filter((course) => !selectedCourseIds.includes(course.id || ""))
        );
      } catch (error) {
        console.error("Failed to delete courses:", error);
        // 에러가 발생해도 로컬에서는 삭제 (낙관적 업데이트)
        setCourses((prev) =>
          prev.filter((course) => !selectedCourseIds.includes(course.id || ""))
        );
      }

      // 삭제 모드 종료
      setIsDeleteMode(false);
      setSelectedCourseIds([]);
    }
  };

  const handleEdit = () => {
    if (!isEditMode) {
      // 편집 모드 시작
      setIsEditMode(true);
      setIsDeleteMode(false); // 삭제 모드 비활성화
      setSelectedCourseIds([]); // 선택된 항목 초기화
    } else {
      // 편집 모드 종료
      setIsEditMode(false);
      setEditingCourse(null);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleCloseEditModal = () => {
    setEditModalVisible(false);
    setEditingCourse(null);
  };

  // 제목과 subtitle 생성 함수
  const generateTitleAndSubtitle = (
    destinations: string[],
    startDate: string,
    endDate: string,
  ) => {
    let title = "새로운 여행 코스";
    let subtitle = "새로운 여행 계획";

    if (destinations.length > 0) {
      const mainDestination = destinations[0];
      title = `${mainDestination} 여행 코스`;
    }

    if (startDate && endDate) {
      const startMonth = parseInt(startDate.split(".")[1]);
      const endMonth = parseInt(endDate.split(".")[1]);

      if (
        (startMonth >= 6 && startMonth <= 8) ||
        (endMonth >= 6 && endMonth <= 8)
      ) {
        subtitle = "이열치열 여름 나기";
      } else if (
        (startMonth >= 3 && startMonth <= 5) ||
        (endMonth >= 3 && endMonth <= 5)
      ) {
        subtitle = "봄바람 휘날리는 계절";
      } else if (
        (startMonth >= 9 && startMonth <= 11) ||
        (endMonth >= 9 && endMonth <= 11)
      ) {
        subtitle = "단풍 물든 가을 여행";
      } else {
        subtitle = "눈 내리는 겨울 풍경";
      }
    }

    return { title, subtitle };
  };

  const handleCompleteEditModal = async (data: {
    startDate: string;
    endDate: string;
    selectedDestinations: string[];
    selectedFoods: string[];
  }) => {
    if (!editingCourse) return;

    console.log("여행 계획 수정", data);

    // Convert date format from "YY.MM.DD" to "YYYY-MM-DD"
    const convertToISODate = (dateStr: string) => {
      const [year, month, day] = dateStr.split(".");
      const fullYear = year.length === 2 ? `20${year}` : year;
      return `${fullYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    };

    const { title, subtitle } = generateTitleAndSubtitle(
      data.selectedDestinations,
      data.startDate,
      data.endDate,
    );

    const courseInfo = {
      title,
      description: subtitle,
      routes: editingCourse.routes || [],
      start_date: convertToISODate(data.startDate),
      end_date: convertToISODate(data.endDate),
      destination: data.selectedDestinations.join(","),
    };

    try {
      const response = await TravelCourses.travelCoursesPartialUpdate({
        path: { id: editingCourse.id || "" },
        body: courseInfo,
      });

      const updatedCourse = response.data;

      if (!updatedCourse) {
        throw new Error("Failed to update course");
      }

      // 로컬 상태 업데이트
      setCourses((prev) =>
        prev.map((course) =>
          course.id === editingCourse.id ? updatedCourse : course
        )
      );

      setEditModalVisible(false);
      setEditingCourse(null);
      setIsEditMode(false); // 편집 모드 종료
    } catch (error) {
      console.error("Failed to update course:", error);
      // 에러 처리 - 여기서는 단순히 로그만 출력
    }
  };

  const handleCompleteModal = async (data: {
    startDate: string;
    endDate: string;
    selectedDestinations: string[];
    selectedFoods: string[];
  }) => {
    console.log("여행 계획 완료", data);

    // Convert date format from "YY.MM.DD" to "YYYY-MM-DD"
    const convertToISODate = (dateStr: string) => {
      const [year, month, day] = dateStr.split(".");
      const fullYear = year.length === 2 ? `20${year}` : year;
      return `${fullYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    };

    const { title, subtitle } = generateTitleAndSubtitle(
      data.selectedDestinations,
      data.startDate,
      data.endDate,
    );

    const courseInfo = {
      title,
      description: subtitle,
      routes: [],
      start_date: convertToISODate(data.startDate),
      end_date: convertToISODate(data.endDate),
      destination: data.selectedDestinations.join(","),
    };

    try {
      const response = await TravelCourses.travelCoursesCreate({
        body: courseInfo,
      });

      const createdCourse = response.data;

      if (!createdCourse) {
        throw new Error("Failed to create course");
      }

      setNewCourse(createdCourse);
      setCourses((prev) => [createdCourse, ...prev]);

      setModalVisible(false);

      router.push({
        pathname: `/plan/${createdCourse.id}` as any,
        params: {
          startDate: data.startDate,
          endDate: data.endDate,
          destinations: data.selectedDestinations.join(","),
          foods: data.selectedFoods.join(","),
          isNew: "true",
        },
      });
    } catch (error) {
      console.error("Failed to create course:", error);
      // Fallback: use timestamp ID for local state
      const fallbackCourse = { ...courseInfo, id: Date.now().toString() };
      setNewCourse(fallbackCourse);
      setCourses((prev) => [fallbackCourse, ...prev]);

      setModalVisible(false);

      router.push({
        pathname: `/plan/${fallbackCourse.id}` as any,
        params: {
          startDate: data.startDate,
          endDate: data.endDate,
          destinations: data.selectedDestinations.join(","),
          foods: data.selectedFoods.join(","),
          isNew: "true",
        },
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="내 여행코스" subtitle="나만의 여행 계획을 만들어보세요" />
      <View style={styles.actionSection}>
        <ActionButtons
          actions={[
            {
              label: isEditMode ? "취소" : "편집",
              onPress: handleEdit
            },
            {
              label: isDeleteMode
                ? selectedCourseIds.length > 0
                  ? `삭제 (${selectedCourseIds.length}개)`
                  : "취소"
                : "경로 삭제",
              onPress: handleDelete
            },
          ]}
        />
      </View>

      {/* ✅ 실제 CourseList 사용 */}
      <CourseList
        courses={courses}
        newCourse={newCourse}
        onAddCourse={handleAddCourse}
        isDeleteMode={isDeleteMode}
        selectedCourseIds={selectedCourseIds}
        onCourseSelect={(courseId: string) => {
          if (isDeleteMode) {
            setSelectedCourseIds((prev) =>
              prev.includes(courseId)
                ? prev.filter((id) => id !== courseId)
                : [...prev, courseId]
            );
          } else if (isEditMode) {
            // 편집 모드에서는 해당 코스 편집
            const courseToEdit = courses.find(course => course.id === courseId);
            if (courseToEdit) {
              setEditingCourse(courseToEdit);
              setEditModalVisible(true);
            }
          }
        }}
        isEditMode={isEditMode}
      />

      <CreateCourseModal
        visible={modalVisible}
        onClose={handleCloseModal}
        onComplete={handleCompleteModal}
      />

      <CreateCourseModal
        visible={editModalVisible}
        onClose={handleCloseEditModal}
        onComplete={handleCompleteEditModal}
        editMode={true}
        initialData={editingCourse ? {
          title: editingCourse.title,
          description: editingCourse.description,
          startDate: editingCourse.start_date ?
            editingCourse.start_date.split('-').map((part, index) =>
              index === 0 ? part.slice(2) : part
            ).join('.') : "",
          endDate: editingCourse.end_date ?
            editingCourse.end_date.split('-').map((part, index) =>
              index === 0 ? part.slice(2) : part
            ).join('.') : "",
          destinations: editingCourse.destination ?
            editingCourse.destination.split(',').filter(d => d.trim()) : [],
          foods: [] // 음식 정보는 course에 저장되지 않음
        } : undefined}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  actionSection: {
    backgroundColor: Colors.white,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: "flex-end",
  },
});
