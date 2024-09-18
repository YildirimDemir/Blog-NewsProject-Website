import { NextResponse } from 'next/server';
import { hashPassword, verifyPassword } from "@/lib/authBcrypt";
import User from "@/models/userModel";
import { connectToDB } from '@/lib/mongodb';

export const PATCH = async (req: Request, { params }: { params: { userId: string } }) => {
    const { userId } = params;
    const { passwordCurrent, newPassword, passwordConfirm } = await req.json();

    if (!userId) {
        return NextResponse.json({ message: "User ID not provided." }, { status: 400 });
    }

    if (!passwordCurrent || !newPassword || !passwordConfirm) {
        return NextResponse.json({ message: "All password fields are required." }, { status: 400 });
    }

    await connectToDB();

    try {
        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ message: "User not found." }, { status: 404 });
        }

        if (!user.password) {
            return NextResponse.json({ message: "Password not found for user." }, { status: 500 });
        }

        const isValid = await verifyPassword(passwordCurrent, user.password);
        if (!isValid) {
            return NextResponse.json({ message: "Current password is incorrect." }, { status: 403 });
        }

        if (newPassword !== passwordConfirm) {
            return NextResponse.json({ message: "New passwords do not match." }, { status: 422 });
        }

        const hashedPassword = await hashPassword(newPassword);

        const updatedUser = await User.findByIdAndUpdate(userId, { password: hashedPassword }, { new: true, runValidators: true });

        if (!updatedUser) {
            return NextResponse.json({ message: "Password update failed." }, { status: 500 });
        }

        return NextResponse.json(updatedUser, { status: 200 });
    } catch (error) {
        console.error('Error updating password:', error);
        return NextResponse.json({ message: "Internal server error." }, { status: 500 });
    }
};
