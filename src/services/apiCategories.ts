import { getSession } from "next-auth/react";

export async function getCategories() {
    try {
        const session = await getSession();
        if (!session || !session.user || !session.user.email) {
            throw new Error('User not authenticated');
        }

        const res = await fetch(`${process.env.WEBSITE_API_URL}/api/categories`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session.user.email}`
            },
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Failed to fetch categories");
        }

        return data;
    } catch (error) {
        throw error;
    }
}

export async function getCategoryById(id: string) {
    try {
        const session = await getSession();
        if (!session || !session.user || !session.user.email) {
            throw new Error('User not authenticated');
        }

        const res = await fetch(`${process.env.WEBSITE_API_URL}/api/categories/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session.user.email}` 
            },
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Failed to fetch category");
        }

        return data;
    } catch (error) {
        throw error;
    }
}
