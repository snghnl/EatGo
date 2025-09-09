import { useState, useEffect } from "react";
import { TravelCourses } from "@/src/client/sdk.gen";
import type { TravelCourse } from "@/src/client/types.gen";

export const useTravelCourse = (courseId: string | undefined) => {
    const [course, setCourse] = useState<TravelCourse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCourse = async () => {
        if (!courseId) {
            setCourse(null);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            const response = await TravelCourses.travelCoursesRead({
                path: { id: courseId },
            });
            if (response.data) {
                setCourse(response.data);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch course");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCourse();
    }, [courseId]);

    return {
        course,
        isLoading,
        error,
        refetch: fetchCourse,
    };
};
