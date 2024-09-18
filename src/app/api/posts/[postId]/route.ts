import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth/next';
import { connectToDB } from '@/lib/mongodb';
import Post from '@/models/postModel';
import User from '@/models/userModel';
import Comment from '@/models/commentModel';


export async function GET(req: NextRequest, { params }: { params: { postId: string } }) {
  try {
    const { postId } = params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return NextResponse.json({ message: "Invalid post ID" }, { status: 400 });
    }

    await connectToDB();
    
    const post = await Post.findById(postId)
      .populate('author', 'username') 
      .populate('category', 'name')
      .populate({
        path: 'comments',
        populate: {
          path: 'user',
          select: 'username' 
        }
      })
      .exec();

    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(post, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching post:', error.message);
      return NextResponse.json({ message: 'Failed to fetch post', details: error.message }, { status: 500 });
    } else {
      console.error('An unknown error occurred');
      return NextResponse.json({ message: 'Failed to fetch post', details: 'An unknown error occurred' }, { status: 500 });
    }
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { postId: string } }) {
  try {
    const { postId } = params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return NextResponse.json({ message: "Invalid post ID" }, { status: 400 });
    }

    const session = await getServerSession();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ message: "You are not allowed!" }, { status: 401 });
    }

    await connectToDB();
    const user = await User.findOne({ email: session.user.email }).exec();
    if (!user) {
      return NextResponse.json({ message: "User not found!" }, { status: 404 });
    }

    const post = await Post.findById(postId)
      .populate({
        path: 'comments',
        populate: { path: 'user', select: 'username' }
      })
      .exec();

    if (!post) {
      return NextResponse.json({ message: "Post not found!" }, { status: 404 });
    }

    if ((user._id as mongoose.Types.ObjectId).toString() !== post.author.toString() && user.userRole !== 'admin') {
      return NextResponse.json({ message: "You do not have permission to edit this post." }, { status: 403 });
    }

    const { title, text, image, category, newCommentId } = await req.json();

    if (title !== undefined) post.title = title;
    if (text !== undefined) post.text = text;
    if (image !== undefined) post.image = image;
    if (category !== undefined) post.category = new mongoose.Types.ObjectId(category);

    if (newCommentId) {
      const comment = await Comment.findById(newCommentId).exec();
      if (comment) {
        post.comments.push(comment._id as mongoose.Types.ObjectId);
      } else {
        return NextResponse.json({ message: "Comment not found!" }, { status: 404 });
      }
    }

    await post.save();

    return NextResponse.json({ message: "Post updated successfully", post }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error updating post:', error.message);
      return NextResponse.json({ message: 'Failed to update post', details: error.message }, { status: 500 });
    } else {
      console.error('An unknown error occurred');
      return NextResponse.json({ message: 'Failed to update post', details: 'An unknown error occurred' }, { status: 500 });
    }
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { postId: string } }) {
  try {
    const { postId } = params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return NextResponse.json({ message: "Invalid post ID" }, { status: 400 });
    }

    const session = await getServerSession();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ message: "You are not allowed!" }, { status: 401 });
    }

    await connectToDB();
    const user = await User.findOne({ email: session.user.email }).exec();
    if (!user) {
      return NextResponse.json({ message: "User not found!" }, { status: 404 });
    }

    const post = await Post.findById(postId).exec();
    if (!post) {
      return NextResponse.json({ message: "Post not found!" }, { status: 404 });
    }

    if ((user._id as mongoose.Types.ObjectId).toString() !== post.author.toString() && user.userRole !== 'admin') {
      return NextResponse.json({ message: "You do not have permission to delete this post." }, { status: 403 });
    }

    await Post.findByIdAndDelete(postId);

    return NextResponse.json({ message: "Post deleted successfully" }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error deleting post:', error.message);
      return NextResponse.json({ message: 'Failed to delete post', details: error.message }, { status: 500 });
    } else {
      console.error('An unknown error occurred');
      return NextResponse.json({ message: 'Failed to delete post', details: 'An unknown error occurred' }, { status: 500 });
    }
  }
}
