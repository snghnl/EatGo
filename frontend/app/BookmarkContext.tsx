import React, { createContext, useContext, useState, ReactNode } from 'react';

type BookmarkContextType = {
    bookmarkedPlaceIds: string[];
    toggleBookmark: (placeId: string) => void;
};

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

export const useBookmark = () => {
    const ctx = useContext(BookmarkContext);
    if (!ctx) throw new Error('useBookmark must be used within BookmarkProvider');
    return ctx;
};

export const BookmarkProvider = ({ children }: { children: ReactNode }) => {
    const [bookmarkedPlaceIds, setBookmarkedPlaceIds] = useState<string[]>([]);

    const toggleBookmark = (placeId: string) => {
        setBookmarkedPlaceIds((prev) =>
            prev.includes(placeId) ? prev.filter((id) => id !== placeId) : [...prev, placeId]
        );
    };

    return (
        <BookmarkContext.Provider value={{ bookmarkedPlaceIds, toggleBookmark }}>{children}</BookmarkContext.Provider>
    );
};
