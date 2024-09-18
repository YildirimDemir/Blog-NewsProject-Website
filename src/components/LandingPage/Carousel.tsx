'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Style from './carousel.module.css';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Image from 'next/image';
import { getPosts } from '@/services/apiPosts'; 
import { getDownloadURL, ref } from 'firebase/storage'; 
import { storage } from '@/firebase'; 
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function EmblaCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000 })]);
  
  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPosts() {
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
          setPosts(postsWithImages.slice(0, 5));
        } else {
          throw new Error('Data is not an array');
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
        setError('Failed to load posts'); 
      } finally {
        setLoading(false); 
      }
    }

    fetchPosts();
  }, []);

  const handleRedirect = (postId: string) => {
    router.push(`/posts/${postId}`);
};

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>; 
  }

  return (
    <div className="embla mx-auto mt-1 mb-1 h-96 w-2/4 border" ref={emblaRef}>
      <div className="embla__container h-full flex">
        {posts.map((post) => (
          <div key={post._id} className={`${Style.embla__slide} ${Style.slide}`}>
            <div className={Style.imgBox}>
              {post.imageUrl ? (
                <Image src={post.imageUrl} alt={post.title} width={400} height={300} />
              ) : (
                <p>No image</p> 
              )}
            </div>
            <div className={Style.titleBox}>
              <h2>{post.title}</h2>
              <p>{post.category ? post.category.name : 'No category'}</p>
              <button onClick={() => handleRedirect(post._id)}>Detail</button>
            </div>
          </div>
        ))}
      </div>
      <div className={Style.btns}>
        <button
          onClick={scrollPrev}
        >
          {'<'}
        </button>
        <button
          onClick={scrollNext}
        >
          {'>'}
        </button>
      </div>
    </div>
  );
}
