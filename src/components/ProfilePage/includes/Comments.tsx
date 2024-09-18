"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import Style from '../profile.module.css';
import { requestUser } from '@/services/apiUsers'; 
import { getCommentById } from '@/services/apiComments'; 

interface Comment {
    _id: string;
    text: string;
    post: {
        _id: string;
        title: string;
    };
    createdAt: string;
}

export default function Comments() {
    const { data: session } = useSession();


    const { data: user, isLoading: userLoading, error: userError } = useQuery({
        queryKey: ['request-user', session?.user?.email],
        queryFn: async () => {
            if (!session?.user?.email) {
                throw new Error('No email found in session');
            }
            return await requestUser(session.user.email);
        }
    });


    const { data: comments, isLoading: commentsLoading, error: commentsError } = useQuery({
        queryKey: ['userComments', user?.comments],
        queryFn: async () => {
            if (!user?.comments || user.comments.length === 0) {
                return [];
            }
            const commentFetchPromises = (user.comments as string[]).map(id => getCommentById(id));
            return Promise.all(commentFetchPromises);
        }
    });

    if (userLoading || commentsLoading) return <div>Loading comments...</div>;
    if (userError) return <div>Error loading user: {userError.message}</div>;
    if (commentsError) return <div>Error loading comments: {commentsError.message}</div>;
    console.log('Fetched Comments:', comments);


    return (
        <div className={Style.commentsArea}>
            <h2>Your Comments</h2>
            {comments && comments.length > 0 ? (
                <div className={Style.comments}>
                    {comments.map((comment: Comment) => (
                        <div key={comment._id} className={Style.commentBox}>
                            <p>
                                <a 
                                    href={`${process.env.WEBSITE_API_URL}/posts/${comment.post}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {'<<View Post>>'}
                                </a>
                            </p>
                            <p>{new Date(comment.createdAt).toLocaleString()}</p>
                            <p className={Style.commentText}>: {comment.text}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No comments yet.</p>
            )}
        </div>
    );
}
