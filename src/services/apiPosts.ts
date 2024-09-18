import { getSession } from "next-auth/react";
export async function getPosts(userId?: string, categoryId?: string) {
    try {
        const queryParams = new URLSearchParams();
        if (userId) {
            queryParams.append('userId', userId);
        }
        if (categoryId) {
            queryParams.append('categoryId', categoryId);
        }

        const res = await fetch(`${process.env.WEBSITE_API_URL}/api/posts?${queryParams.toString()}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Failed to fetch posts");
        }

        if (data && Array.isArray(data.posts)) {
            return data.posts;
        } else {
            throw new Error('Unexpected data format');
        }
    } catch (error) {
        console.error('Error fetching posts:', error);
        throw error;
    }
}

export async function updatePost(id: string, updatedData: { title?: string; text?: string; image?: string; category?: string }) {
    try {
        const res = await fetch(`${process.env.WEBSITE_API_URL}/api/posts/${id}`, {
            method: "PATCH",
            body: JSON.stringify(updatedData),
            headers: {
                "Content-Type": "application/json",
            },
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Failed to update post");
        }

        return data;
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error updating post:', error.message);
        } else {
            console.error('An unknown error occurred');
        }
        throw error;
    }
}

export async function getPostById(id: string) {
    try {
        const res = await fetch(`${process.env.WEBSITE_API_URL}/api/posts/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Failed to fetch post");
        }

        return data;
    } catch (error) {
        console.error('Error fetching post:', error);
        throw error;
    }
}