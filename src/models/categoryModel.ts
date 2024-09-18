import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICategory extends Document {
    name: string;
}

const categorySchema = new Schema<ICategory>({
    name: {
        type: String,
        required: [true, 'A category name is required'],
        unique: true,
    },
}, {
    timestamps: true,
});

const Category: Model<ICategory> = mongoose.models.Category || mongoose.model<ICategory>('Category', categorySchema);

export default Category;
