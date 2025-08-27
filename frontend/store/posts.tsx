// store/posts.tsx
import React, { createContext, useContext, useMemo, useState } from 'react';

export type Post = {
    id: string;
    title: string;
    content: string;
    images: string[];
    courseId?: string;
    createdAt: number;
};

type PostContextValue = {
    posts: Post[];
    addPost: (p: Omit<Post, 'createdAt'>) => void;
    getPostsByCourse: (courseId: string) => Post[];
    getPostById: (id: string) => Post | undefined;
};

const PostContext = createContext<PostContextValue | null>(null);

export function PostProvider({ children }: { children: React.ReactNode }) {
    const [posts, setPosts] = useState<Post[]>([]);

    const addPost: PostContextValue['addPost'] = (p) => {
        const n = normalize(p);
        console.log('[PostStore] addPost ->', n);
        setPosts((prev) => [{ ...n, createdAt: n.createdAt }, ...prev]);
    };
    const toStr = (v: any) => (v == null ? undefined : String(v));
    const normalize = (p: any) => ({
        ...p,
        id: toStr(p?.id)!,
        courseId: toStr(p?.courseId ?? p?.course_id), // ✅ string
        createdAt: p?.createdAt ?? p?.created_at ?? Date.now(),
    });
    const getPostsByCourse = (courseId: string | number | null | undefined) => {
        const key = toStr(courseId);
        if (!key) return [];
        return posts
            .map(normalize)
            .filter((x) => toStr(x.courseId) === key) // ✅ 문자열 비교
            .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    };
    const getPostById = (id: string | number | null | undefined) =>
        posts.map(normalize).find((x) => toStr(x.id) === toStr(id));
    const value = useMemo(() => ({ posts, addPost, getPostsByCourse, getPostById }), [posts]);
    return <PostContext.Provider value={value}>{children}</PostContext.Provider>;
}

export function usePostStore() {
    const ctx = useContext(PostContext);
    if (!ctx) throw new Error('PostProvider로 앱을 감싸주세요');
    return ctx;
}
