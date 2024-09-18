'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Style from './post.module.css';
import Image from 'next/image';
import { FaRegComment, FaRegThumbsUp } from 'react-icons/fa';
import { getPostById } from '@/services/apiPosts';
import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from '@/firebase';
import { createComment, deleteComment } from '@/services/apiComments';
import { requestUser, toggleLike } from '@/services/apiUsers';
import { getSession } from 'next-auth/react';

export default function SinglePost() {
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [userSession, setUserSession] = useState<any>(null);
  const { postId } = useParams();

  useEffect(() => {
    async function fetchPost() {
      setLoading(true);
      try {
        const id = Array.isArray(postId) ? postId[0] : postId;
        if (!id) throw new Error('Post ID is missing');

        const fetchedPost = await getPostById(id);

        if (fetchedPost?.image) {
          try {
            const imageRef = ref(storage, fetchedPost.image);
            fetchedPost.imageUrl = await getDownloadURL(imageRef);
          } catch (imageError) {
            console.error('Error fetching image URL:', imageError);
            fetchedPost.imageUrl = '';
          }
        }

        setPost(fetchedPost);
      } catch (error) {
        console.error('Error fetching post:', error);
        setError('Failed to load the post');
      } finally {
        setLoading(false);
      }
    }

    async function fetchUserSession() {
      try {
        const session = await getSession();
        if (!session?.user?.email) throw new Error('User email not found');

        const user = await requestUser(session.user.email);
        setUserSession(user);
      } catch (error) {
        console.error('Error fetching user session:', error);
      }
    }

    if (postId) {
      fetchPost();
      fetchUserSession();
    }
  }, [postId]);

  const handleLikeToggle = async () => {
    if (!userSession) {
        setError('You must be logged in to like a post.');
        return;
    }

    try {
        const id = Array.isArray(postId) ? postId[0] : postId;

        const updatedUser = await toggleLike(userSession._id, id, post?.likes?.includes(userSession._id) ? 'remove' : 'add');

        setPost((prevPost: any) => {
            if (!prevPost) return prevPost;

            const isLiked = prevPost.likes.includes(userSession._id);
            const updatedLikes = isLiked 
                ? prevPost.likes.filter((like: string) => like !== userSession._id)
                : [...prevPost.likes, userSession._id];

            return {
                ...prevPost,
                likes: updatedLikes,
            };
        });

        setError(null);
    } catch (error) {
        console.error('Failed to toggle like:', error);
        setError('Failed to toggle like');
    }
};


  const handleCommentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewComment(event.target.value);
  };

  const handleCommentSubmit = async () => {
    if (!userSession) {
      setError('You must be logged in to comment.');
      return;
    }

    if (newComment.trim() === '') {
      setError('Comment cannot be empty.');
      return;
    }

    try {
      const id = Array.isArray(postId) ? postId[0] : postId;
      const addedComment = await createComment(id as string, newComment);

      setPost((prevPost: any) => {
        if (!prevPost) return prevPost;
        return {
          ...prevPost,
          comments: [...prevPost.comments, addedComment],
        };
      });

      setNewComment('');
      setError(null);
    } catch (error) {
      console.error('Failed to create comment:', error);
      setError('Failed to add comment');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(commentId);

      setPost((prevPost: any) => {
        if (!prevPost) return prevPost;
        return {
          ...prevPost,
          comments: prevPost.comments.filter((comment: any) => comment._id !== commentId),
        };
      });
    } catch (error) {
      console.error('Failed to delete comment:', error);
      setError('Failed to delete comment');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!post) return <p>No post found</p>;

  return (
    <div className={Style.singlePostPage}>
      <div className={Style.postArea}>
        <div className={Style.postImage}>
          {post?.imageUrl ? (
            <Image src={post.imageUrl} alt={post.title} width={500} height={300} />
          ) : (
            <p>No Image Available</p>
          )}
        </div>
        <div className={Style.postContent}>
          <div className={Style.postInfo}>
            <span>{post?.author?.username || 'Unknown Author'}</span>
            |
            {/* <span>{post?.category.name || 'No Category'}</span> */}
          </div>
          <h1>{post?.title || 'Title'}</h1>
          <p>{post?.text || 'Text'}</p>
        </div>
        <div className={Style.likeAndComments}>
          <div className={Style.numberOfData}>
            <span onClick={handleLikeToggle}>
              <FaRegThumbsUp /> {post?.likes?.length || 0}
            </span>
            <span><FaRegComment /> {post?.comments?.length || 0}</span>
          </div>
          <div className={Style.addComment}>
            {userSession ? (
              <>
                <input
                  type="text"
                  placeholder="Write your comment..."
                  value={newComment}
                  onChange={handleCommentChange}
                />
                <button onClick={handleCommentSubmit}>Share</button>
              </>
            ) : (
              <p>Login to share a comment</p>
            )}
          </div>
          <div className={Style.postsComments}>
            {post?.comments?.length ? (
              post.comments.map((comment: any) => (
                <div key={comment._id} className={Style.commentBox}>
                  <span>User: {comment.user?.username || 'Unknown'}</span>
                  <p>{comment.text || 'No Comment Text'}</p>
                  {userSession?._id === comment.user?._id && (
                    <button onClick={() => handleDeleteComment(comment._id)}>X</button>
                  )}
                </div>
              ))
            ) : (
              <p>No comments yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
