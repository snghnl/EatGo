import React, { createContext, useContext, useState, ReactNode } from "react";

type BookmarkContextType = {
  bookmarkedPlaceIds: string[];
  toggleBookmark: (placeId: string) => void;
  bookmarkedCourseIds: string[];
  toggleCourseBookmark: (courseId: string) => void;
};

const BookmarkContext = createContext<BookmarkContextType | undefined>(
  undefined,
);

export const useBookmark = () => {
  const ctx = useContext(BookmarkContext);
  if (!ctx) throw new Error("useBookmark must be used within BookmarkProvider");
  return ctx;
};

export const BookmarkProvider = ({ children }: { children: ReactNode }) => {
  const [bookmarkedPlaceIds, setBookmarkedPlaceIds] = useState<string[]>([]);
  const [bookmarkedCourseIds, setBookmarkedCourseIds] = useState<string[]>([]);

  const toggleBookmark = (placeId: string) => {
    setBookmarkedPlaceIds((prev) =>
      prev.includes(placeId)
        ? prev.filter((id) => id !== placeId)
        : [...prev, placeId],
    );
  };

  const toggleCourseBookmark = (courseId: string) => {
    setBookmarkedCourseIds((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId],
    );
  };

  return (
    <BookmarkContext.Provider
      value={{
        bookmarkedPlaceIds,
        toggleBookmark,
        bookmarkedCourseIds,
        toggleCourseBookmark,
      }}
    >
      {children}
    </BookmarkContext.Provider>
  );
};
