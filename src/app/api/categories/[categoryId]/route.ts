import { NextRequest, NextResponse } from 'next/server';
import Category, { ICategory } from '@/models/categoryModel';
import { connectToDB } from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET(req: NextRequest, { params }: { params: { categoryId: string } }) {
    const { categoryId } = params;

    if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) {
        return NextResponse.json({ message: "Invalid category ID." }, { status: 400 });
    }

    try {
        await connectToDB();

        const category: ICategory | null = await Category.findById(categoryId);

        if (!category) {
            return NextResponse.json({ message: "Category not found." }, { status: 404 });
        }

        return NextResponse.json(category, { status: 200 });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('Error fetching category:', error.message);
            return NextResponse.json({ message: 'Failed to fetch category', details: error.message }, { status: 500 });
        } else {
            console.error('An unknown error occurred');
            return NextResponse.json({ message: 'Failed to fetch category', details: 'An unknown error occurred' }, { status: 500 });
        }
    }
}

export async function PATCH(req: NextRequest, { params }: { params: { categoryId: string } }) {
    const { categoryId } = params;
    const { name } = await req.json();

    if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) {
        return NextResponse.json({ message: "Invalid category ID." }, { status: 400 });
    }

    if (!name) {
        return NextResponse.json({ message: "Category name is required." }, { status: 400 });
    }

    try {
        await connectToDB();

        const updatedCategory: ICategory | null = await Category.findByIdAndUpdate(
            categoryId,
            { name },
            { new: true, runValidators: true }
        );

        if (!updatedCategory) {
            return NextResponse.json({ message: "Category not found." }, { status: 404 });
        }

        return NextResponse.json({ message: "Category updated successfully", category: updatedCategory }, { status: 200 });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('Error updating category:', error.message);
            return NextResponse.json({ message: 'Failed to update category', details: error.message }, { status: 500 });
        } else {
            console.error('An unknown error occurred');
            return NextResponse.json({ message: 'Failed to update category', details: 'An unknown error occurred' }, { status: 500 });
        }
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { categoryId: string } }) {
    const { categoryId } = params;

    if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) {
        return NextResponse.json({ message: "Invalid category ID." }, { status: 400 });
    }

    try {
        await connectToDB();

        const deletedCategory = await Category.findByIdAndDelete(categoryId);

        if (!deletedCategory) {
            return NextResponse.json({ message: "Category not found." }, { status: 404 });
        }

        return NextResponse.json({ message: "Category deleted successfully" }, { status: 200 });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('Error deleting category:', error.message);
            return NextResponse.json({ message: 'Failed to delete category', details: error.message }, { status: 500 });
        } else {
            console.error('An unknown error occurred');
            return NextResponse.json({ message: 'Failed to delete category', details: 'An unknown error occurred' }, { status: 500 });
        }
    }
}
