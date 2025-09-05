import { useState, useEffect } from "react";
import { Community } from "@/src/client/sdk.gen";
import type {
    PostListOutput,
    PostDetailOutput,
    PostListInput,
    PostCommentsInput,
    CommentDetailOutput,
    PostLikeOutput,
} from "@/src/client/types.gen";

export interface CommunityPost extends PostListOutput {
    // Frontend-specific extensions
    isLoading?: boolean;
}

export interface CommunityComment extends CommentDetailOutput {
    // Frontend-specific extensions
}

// Hook for fetching posts list
export const usePosts = () => {
    const [posts, setPosts] = useState<CommunityPost[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPosts = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await Community.communityPostsList();
            if (response.data) {
                setPosts(response.data);
            }
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to fetch posts"
            );
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const refreshPosts = () => {
        fetchPosts();
    };

    return {
        posts,
        isLoading,
        error,
        refreshPosts,
    };
};

// Hook for fetching a single post with details
export const usePost = (postId: string | undefined) => {
    const [post, setPost] = useState<PostDetailOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPost = async () => {
        if (!postId) return;

        try {
            setIsLoading(true);
            setError(null);
            const response = await Community.communityPostsRead({
                path: { post_id: postId },
            });
            if (response.data) {
                setPost(response.data);
            }
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to fetch post"
            );
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (postId) {
            fetchPost();
        }
    }, [postId]);

    const refreshPost = () => {
        fetchPost();
    };

    return {
        post,
        isLoading,
        error,
        refreshPost,
    };
};

// Hook for creating posts
export const useCreatePost = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createPost = async (
        postData: PostListInput
    ): Promise<PostListOutput | null> => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await Community.communityPostsCreate({
                body: postData,
            });
            return response.data || null;
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to create post"
            );
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        createPost,
        isLoading,
        error,
    };
};

// Hook for updating posts
export const useUpdatePost = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updatePost = async (
        postId: string,
        postData: Partial<PostListInput>
    ): Promise<PostDetailOutput | null> => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await Community.communityPostsPartialUpdate({
                path: { post_id: postId },
                body: postData,
            });
            return response.data || null;
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to update post"
            );
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        updatePost,
        isLoading,
        error,
    };
};

// Hook for deleting posts
export const useDeletePost = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const deletePost = async (postId: string): Promise<boolean> => {
        try {
            setIsLoading(true);
            setError(null);
            await Community.communityPostsDelete({
                path: { post_id: postId },
            });
            return true;
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to delete post"
            );
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        deletePost,
        isLoading,
        error,
    };
};

// Hook for toggling post likes
export const useTogglePostLike = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const toggleLike = async (
        postId: string
    ): Promise<PostLikeOutput | null> => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await Community.communityPostsLikeCreate({
                path: { post_id: postId },
            });
            return response.data || null;
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to toggle like"
            );
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        toggleLike,
        isLoading,
        error,
    };
};

// Hook for fetching post comments
export const usePostComments = (postId: string | undefined) => {
    const [comments, setComments] = useState<CommunityComment[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchComments = async () => {
        if (!postId) return;

        try {
            setIsLoading(true);
            setError(null);
            const response = await Community.communityPostsCommentsList({
                path: { post_id: postId },
            });
            if (response.data) {
                setComments(response.data);
            }
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to fetch comments"
            );
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (postId) {
            fetchComments();
        }
    }, [postId]);

    const refreshComments = () => {
        fetchComments();
    };

    return {
        comments,
        isLoading,
        error,
        refreshComments,
    };
};

// Hook for creating comments
export const useCreateComment = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createComment = async (
        postId: string,
        commentData: PostCommentsInput
    ): Promise<CommentDetailOutput | null> => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await Community.communityPostsCommentsCreate({
                path: { post_id: postId },
                body: commentData,
            });
            return response.data || null;
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to create comment"
            );
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        createComment,
        isLoading,
        error,
    };
};

// Hook for updating comments
export const useUpdateComment = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateComment = async (
        commentId: string,
        content: string
    ): Promise<CommentDetailOutput | null> => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await Community.communityCommentsPartialUpdate({
                path: { comment_id: commentId },
                body: { content },
            });
            return response.data || null;
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to update comment"
            );
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        updateComment,
        isLoading,
        error,
    };
};

// Hook for deleting comments
export const useDeleteComment = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const deleteComment = async (commentId: string): Promise<boolean> => {
        try {
            setIsLoading(true);
            setError(null);
            await Community.communityCommentsDelete({
                path: { comment_id: commentId },
            });
            return true;
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to delete comment"
            );
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        deleteComment,
        isLoading,
        error,
    };
};
