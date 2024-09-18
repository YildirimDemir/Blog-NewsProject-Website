import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import Comment from './commentModel';
import Category from './categoryModel';

export interface IPost extends Document {
    title: string;
    text: string;
    author: Types.ObjectId; 
    image: string;
    comments: Types.ObjectId[]; 
    likes: Types.ObjectId[]; 
    createdAt: Date;
    category: Types.ObjectId;
}

const postSchema = new Schema<IPost>({
    title: {
        type: String,
        required: [true, 'A title is required'],
    },
    text: {
        type: String,
        required: [true, 'Text content is required'],
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User', 
        required: [true, 'An author is required'],
    },
    category: { 
        type: Schema.Types.ObjectId,
        ref: 'Category', 
        required: [true, 'A category is required'],
    },
    image: {
        type: String,
        required: false,
    },
    comments: [{
        type: Schema.Types.ObjectId,
        ref: 'Comment',
    }],
    likes: [{ 
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    }
}, {
    timestamps: true, 
});

postSchema.pre('findOneAndDelete', async function (next) {
    const postId = this.getQuery()._id;

    await Comment.deleteMany({ post: postId });

    next();
});

const Post: Model<IPost> = mongoose.models.Post || mongoose.model<IPost>("Post", postSchema);

export default Post;
