"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { requestUser } from "@/services/apiUsers";
import Style from "./profile.module.css";
import Sidebar from "./includes/Sidebar";
import UserInfo from "./includes/Userinfo";
import Password from "./includes/Password";
import DeleteAccount from "./includes/DeleteAccount";
import Likes from "./includes/Likes";
import Comments from "./includes/Comments";

interface User {
    _id: string;
    username: string;
    email: string;
}

export default function Profile() {
    const [selectedContent, setSelectedContent] = useState<string>("userinfo");
    const { data: session } = useSession();

    const { isLoading, data: user, error } = useQuery<User | undefined, Error>({
        queryKey: ["request-user", session?.user?.email],
        queryFn: async () => {
            if (!session?.user?.email) {
                throw new Error("No email found in session");
            }
            const user = await requestUser(session.user.email);
            return user;
        },
        initialData: session?.user as User | undefined, 
    });

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return (
        <main className={Style.main}>
            <Sidebar setContent={setSelectedContent} />
            <div className={Style.settings}>
                {selectedContent === "userinfo" && user && (
                    <UserInfo user={user} />
                )}
                {selectedContent === "password" && user && (
                    <Password user={user} />
                )}
                {selectedContent === "deleteaccount" && (
                    <DeleteAccount user={user} />
                )}
                {selectedContent === "likes" && (
                    <Likes />
                )}
                {selectedContent === "comments" && (
                    <Comments />
                )}
            </div>
        </main>
    );
}
