import { IUser } from "@/models/userModel";
import { getSession, signIn } from "next-auth/react";
import { signOut } from "next-auth/react";
import { notFound } from "next/navigation";

export const getAllUsers = async (): Promise<IUser[]> => {
    try {
      const response = await fetch('/api/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
  
      const users: IUser[] = await response.json();
  
      if (!users) {
        throw new Error('No users found.');
      }
  
      return users;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('An unknown error occurred.');
    }
  };

export const getUserById = async (userId: string): Promise<IUser | null> => {
    try {
        const res = await fetch(`/api/users/${userId}`, {
            method: 'GET',
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch user with ID: ${userId}`);
        }

        const data: IUser = await res.json();
        return data;
    } catch (error) {
        console.error('Error fetching user:', error);
        throw error;
    }
};  
  
export async function userSignup(newUser: { username: string, name: string, email: string, password: string, passwordConfirm: string, userRole?: string }) {
    try {
        const userRole = newUser.userRole || 'member';

        const res = await fetch(`${process.env.WEBSITE_API_URL}/api/auth/register`, {
            method: "POST",
            body: JSON.stringify({
                username: newUser.username,
                name: newUser.name,
                email: newUser.email,
                password: newUser.password,
                passwordConfirm: newUser.passwordConfirm,
                userRole
            }),
            headers: {
                "Content-type": "application/json",
            }
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Failed to create a user");
        }

        return data;
    } catch (error) {
        throw error;
    }
}


export async function userLogin(data: { email: string, password: string }) {
    const { email, password } = data;

    const result = await signIn("credentials", {
        redirect: false,
        email,
        password
    });

    if (result?.error) throw new Error("Email or password wrong...");
}


export async function userLogout() {
    await signOut();
}

export async function requestUser(email: string): Promise<any> {
    const session = await getSession();
    
    if (!session || !session.user) {
        throw new Error("Unauthorized: No session found");
    }

    const res = await fetch(`${process.env.WEBSITE_API_URL}/api/auth/requestuser/${email}`);

    if (!res.ok) {
        throw new Error("Failed to fetch user by email");
    }

    const user = await res.json();

    if (!user) {
        notFound();
    }

    return user;
}

export async function updateUserData(newData: { id: string, username: string, name: string, email: string }) {
    try {
        const { id, username, name, email } = newData;

        const res = await fetch(`${process.env.WEBSITE_API_URL}/api/users/${id}/userinfo`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, name, email }),
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Failed to update user info");
        }

        return data;
    } catch (error) {
        throw error;
    }
}

export async function updateUserPassword(newData: { id: string, passwordCurrent: string, newPassword: string, passwordConfirm: string }) {
    try {
        const { id, passwordCurrent, newPassword, passwordConfirm } = newData;

        const res = await fetch(`${process.env.WEBSITE_API_URL}/api/users/${id}/update-password`, {
            method: "PATCH",
            body: JSON.stringify({ passwordCurrent, newPassword, passwordConfirm }),
            headers: {
                "Content-type": "application/json",
            }
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Failed to update password");
        }

        await signIn("credentials", {
            redirect: false,
            email: data.email,
            password: data.password
        });

        return data;
    } catch (error) {
        throw error;
    }
}

export const deleteUserAccount = async (userData: { userId: string, password: string, passwordConfirm: string }) => {
    if (userData.password !== userData.passwordConfirm) {
        throw new Error("Passwords do not match");
    }

    const response = await fetch('/api/auth/deleteaccount', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'user-id': userData.userId,
        },
        body: JSON.stringify({ password: userData.password }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Something went wrong');
    }

    await signOut({ redirect: false });

    return response.json();
};

export const deleteUser = async (userId: string) => {
    const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Something went wrong');
    }

    return response.json();
};

export const toggleLike = async (userId: string, postId: string, action: 'add' | 'remove'): Promise<IUser> => {
    try {
        const session = await getSession();
        if (!session || !session.user) {
            throw new Error("Unauthorized: No session found");
        }

        const response = await fetch(`${process.env.WEBSITE_API_URL}/api/users/${userId}/likes/${postId}`, {
            method: action === 'add' ? 'POST' : 'DELETE', 
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to toggle like');
        }

        const updatedUser: IUser = await response.json();
        return updatedUser;
    } catch (error) {
        console.error("Error toggling like:", error);
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error('An unknown error occurred.');
    }
};

