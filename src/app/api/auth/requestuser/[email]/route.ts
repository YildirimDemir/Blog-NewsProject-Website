import { NextApiRequest, NextApiResponse } from 'next';
import User from '@/models/userModel';
import { connectToDB } from '@/lib/mongodb';

export const GET = async (request: NextApiRequest, { params }: { params: { email: string } }): Promise<Response> => {
    const { email } = params;

    if (!email) {
        return new Response(JSON.stringify({ message: "Email not found..." }), { status: 400 });
    }

    await connectToDB();
    const user = await User.findOne({ email });

    if (!user) {
        return new Response(JSON.stringify({ message: "User not found on Email..." }), { status: 404 });
    }

    return new Response(JSON.stringify(user), { status: 200 });
};
