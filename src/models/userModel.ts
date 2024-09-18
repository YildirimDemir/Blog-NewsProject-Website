import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import Post from './postModel';
import Comment from './commentModel';

export interface IUser extends Document {
    username: string;
    name: string;
    email: string;
    password: string;
    userRole: 'admin' | 'editor' | 'member'; 
    posts?: mongoose.Types.ObjectId[];
    likes?: Types.ObjectId[]; 
    comments?: Types.ObjectId[]; 
    resetToken?: string;
    resetTokenExpiry?: Date;
}

const userSchema = new Schema<IUser>({
    username: {
        type: String,
        required: [true, 'A username is required'],
        unique: true,
    },
    name: {
        type: String,
        required: [true, 'A name is required'],
        unique: false
    },
    email: {
        type: String,
        required: [true, 'An email is required'],
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: [true, 'A password is required'],
        minlength: [6, 'Password must be at least 6 characters long'],
    },
    userRole: {
        type: String,
        required: [true, 'User role is required'],
        enum: ['admin', 'editor', 'member'],
        default: 'member',
    },
    posts: [{ 
        type: Schema.Types.ObjectId,
        ref: 'Post' 
    }],
    likes: [{ 
        type: Schema.Types.ObjectId,
        ref: 'Post',
    }],
    comments: [{ 
        type: Schema.Types.ObjectId,
        ref: 'Comment',
    }],
    resetToken: String,
    resetTokenExpiry: Date
}, {
    timestamps: true,
});

userSchema.pre('findOneAndDelete', async function (next) {
    const userId = this.getQuery()._id;

    if (this.getQuery().userRole === 'editor') {
        const posts = await Post.find({ author: userId });
        for (const post of posts) {
            await Comment.deleteMany({ post: post._id });
        }
        await Post.deleteMany({ author: userId });
    }

    await Comment.deleteMany({ user: userId });

    next();
});

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
