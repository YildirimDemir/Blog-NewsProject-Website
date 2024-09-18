import SinglePost from '@/components/Posts/SinglePost'
import Footer from '@/components/ui/Footer/Footer'
import Navbar from '@/components/ui/navbar/Navbar'
import React from 'react'

export default function page() {
  return (
    <>
    <Navbar />
    <SinglePost />
    <Footer />
    </>
  )
}
