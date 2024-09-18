'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Style from './post.module.css';
import Image from 'next/image';
import { getPosts } from '@/services/apiPosts';
import { getDownloadURL, ref } from 'firebase/storage'; 
import { storage } from '@/firebase'; 
import { getCategories } from '@/services/apiCategories';

export default function Posts() {
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([{ _id: 'all', name: 'All' }]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        if (Array.isArray(data.categories)) {
          setCategories(prevCategories => [{ _id: 'all', name: 'All' }, ...data.categories]);
        } else {
          setCategories([{ _id: 'all', name: 'All' }]);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setCategories([{ _id: 'all', name: 'All' }]);
      }
    };

    const fetchPosts = async () => {
      try {
        const data = await getPosts();
        if (Array.isArray(data)) {
          const postsWithImages = await Promise.all(data.map(async (post) => {
            if (post.image) {
              try {
                const imageRef = ref(storage, post.image);
                post.imageUrl = await getDownloadURL(imageRef);
              } catch (imageError) {
                console.error('Error fetching image URL:', imageError);
                post.imageUrl = '';
              }
            }
            return post;
          }));

          const sortedPosts = postsWithImages.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setPosts(sortedPosts);
        } else {
          throw new Error('Data is not an array');
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
        setError('Failed to load posts');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
    fetchPosts();
  }, []);

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleRedirect = (postId: string) => {
    router.push(`/posts/${postId}`);
  };

  const filteredPosts = selectedCategory === 'all'
    ? posts
    : posts.filter(post => post.category?._id === selectedCategory);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className={Style.postsArea}>
      <h1>Posts</h1>
      <div className={Style.categories}>
        {categories.length > 0 ? (
          categories.map(category => (
            <button 
              key={category._id} 
              onClick={() => handleCategoryClick(category._id)}
              className={selectedCategory === category._id ? Style.activeCategory : ''}
            >
              {category.name}
            </button>
          ))
        ) : (
          <p>No categories available</p>
        )}
      </div>
      <div className={Style.posts}>
        {filteredPosts.length === 0 ? (
          <p>No posts available</p>
        ) : (
          filteredPosts.map((post) => (
            <div
              key={post._id}
              className={Style.postBox}
              onClick={() => handleRedirect(post._id)}
            >
              <div className={Style.imgBox}>
                {post.imageUrl ? (
                  <Image src={post.imageUrl} alt={post.title} width={200} height={200} />
                ) : (
                  <p className={Style.noImage}>No Image</p>
                )}
              </div>
              <div className={Style.textBox}>
                <span>{post?.category?.name}</span>
                <p>{post.title}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
