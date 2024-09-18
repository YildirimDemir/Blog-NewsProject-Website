import { useForm } from "react-hook-form";
import { Dispatch, SetStateAction } from "react";
import Style from "./../profile.module.css";
import toast from "react-hot-toast";

interface User {
    _id: string;
    username: string;
    email: string;
}

interface UserInfoProps {
    user: User;
}

export default function UserInfo({ user }: UserInfoProps) {
    const { register, handleSubmit, formState } = useForm({
        defaultValues: {
            username: user.username,
            email: user.email
        }
    });
    const { errors } = formState;

    async function onSubmit(data: { username: string; email: string }) {
        toast.success("User info updated successfully!");
        console.log(data);
    }

    return (
        <div className={Style.userInfo}>
            <h2>User Info Settings</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className={Style.inputBox}>
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        {...register('username', { required: 'This field is required' })}
                    />
                    <p>{errors.username?.message}</p>
                </div>
                <div className={Style.inputBox}>
                    <label htmlFor="email">Email Address</label>
                    <input
                        type="email"
                        id="email"
                        {...register('email', { required: 'This field is required' })}
                    />
                    <p>{errors.email?.message}</p>
                </div>
                <div className={Style.btn}>
                    <button type="submit">Save</button>
                </div>
            </form>
        </div>
    );
}
