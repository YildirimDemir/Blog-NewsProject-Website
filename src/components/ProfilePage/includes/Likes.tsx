"use client";

import React from 'react';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import Style from '../profile.module.css';
import { getPostById } from '@/services/apiPosts'; 
import { requestUser } from '@/services/apiUsers'; 

interface Post {
    _id: string;
    title: string;
    image: string;
}

export default function Likes() {
    const { data: session } = useSession();

    // Kullanıcı bilgilerini çek
    const { data: user, isLoading: userLoading, error: userError } = useQuery({
        queryKey: ['request-user', session?.user?.email],
        queryFn: async () => {
            if (!session?.user?.email) {
                throw new Error('No email found in session');
            }
            return await requestUser(session.user.email);
        }
    });

    const { data: posts, isLoading: postsLoading, error: postsError } = useQuery({
        queryKey: ['likedPosts', user?.likes],
        queryFn: async () => {
            if (!user?.likes || user.likes.length === 0) {
                return [];
            }
            const postFetchPromises = (user.likes as string[]).map(id => getPostById(id));
            return Promise.all(postFetchPromises);
        }
    });

    if (userLoading || postsLoading) return <div>Loading liked posts...</div>;
    if (userError) return <div>Error loading user: {userError.message}</div>;
    if (postsError) return <div>Error loading liked posts: {postsError.message}</div>;

    return (
        <div className={Style.likesArea}>
            <h2>Liked Posts</h2>
            {posts && posts.length > 0 ? (
                <div className={Style.likes}>
                    {posts.map((post: Post) => (
                        <a 
                            key={post._id.toString()} 
                            href={`${process.env.WEBSITE_API_URL}/posts/${post._id}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={Style.likeBox}
                        >
                            <Image 
                                src={post.image} 
                                alt={post.title} 
                                width={200} 
                                height={150} 
                            />
                            <p>{post.title}</p>
                        </a>
                    ))}
                </div>
            ) : (
                <p>No liked posts yet.</p>
            )}
        </div>
    );
}
