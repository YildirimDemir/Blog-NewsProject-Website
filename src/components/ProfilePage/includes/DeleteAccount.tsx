"use client";
import React, { useState } from 'react';
import Style from './../profile.module.css';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useForm, SubmitHandler } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteUserAccount, requestUser } from '@/services/apiUsers';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface User {
    _id: string;
    username: string;
    email: string;
}

interface DeleteAccountProps {
    user?: User; 
}

interface DeleteAccountInputs {
    email: string;
    password: string;
    passwordConfirm: string;
}

export default function DeleteAccount({ user }: DeleteAccountProps) {
    const [showPassword, setShowPassword] = useState({
        password: false,
        passwordConfirm: false,
    });

    const router = useRouter();
    const { register, handleSubmit, formState: { errors }, getValues } = useForm<DeleteAccountInputs>({
        defaultValues: {
            email: user?.email || '', 
        }
    });

    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (data: DeleteAccountInputs) => {
            if (data.password !== data.passwordConfirm) {
                throw new Error("Passwords do not match");
            }
            if (!user) {
                throw new Error("User information is missing");
            }

            const userDetails = await requestUser(user.email);
            console.log("User details before delete:", userDetails);

            // Kullanıcıyı sil
            await deleteUserAccount({
                userId: user._id,
                password: data.password,
                passwordConfirm: data.passwordConfirm,
            });
        },
        onSuccess: () => {
            toast.success("User account deleted successfully");

            queryClient.clear(); 
            localStorage.clear(); 
            sessionStorage.clear(); 
            setTimeout(() => {
                router.replace("/login");
            }, 3000);
        },
        onError: (err: any) => toast.error(err.message),
    });

    const onSubmit: SubmitHandler<DeleteAccountInputs> = (data) => {
        mutation.mutate(data);
    };

    const togglePasswordVisibility = (field: keyof typeof showPassword) => {
        setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
    };

    if (!user) {
        return <div>User not found</div>; 
    }

    return (
        <div className={Style.deleteAccount}>
            <h2>Delete Account</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className={Style.inputBox}>
                    <label htmlFor="email">Email:</label>
                    <input 
                        type="email" 
                        id="email"
                        defaultValue={user?.email || ''} 
                        {...register('email', { required: 'This field is required' })}
                    />
                    <p>{errors.email?.message}</p>
                </div>
                <div className={Style.inputBox}>
                    <label htmlFor="password">Password</label>
                    <div className={Style.passInput}>
                        <input
                            type={showPassword.password ? "text" : "password"}
                            id="password"
                            {...register('password', { required: 'This field is required' })}
                        />
                        <button
                            type="button"
                            onClick={() => togglePasswordVisibility('password')}
                            className={Style.toggleButton}
                        >
                            {showPassword.password ? <FaEye /> : <FaEyeSlash />}
                        </button>
                    </div>
                    <p>{errors.password?.message}</p>
                </div>
                <div className={Style.inputBox}>
                    <label htmlFor="passwordConfirm">Confirm Password</label>
                    <div className={Style.passInput}>
                        <input
                            type={showPassword.passwordConfirm ? "text" : "password"}
                            id="passwordConfirm"
                            {...register('passwordConfirm', {
                                required: 'This field is required',
                                validate: value => value === getValues().password || 'Passwords must match'
                            })}
                        />
                        <button
                            type="button"
                            onClick={() => togglePasswordVisibility('passwordConfirm')}
                            className={Style.toggleButton}
                        >
                            {showPassword.passwordConfirm ? <FaEye /> : <FaEyeSlash />}
                        </button>
                    </div>
                    <p>{errors.passwordConfirm?.message}</p>
                </div>
                <div className={Style.btn}>
                    <button type="submit">Delete</button>
                </div>
            </form>
        </div>
    );
}
