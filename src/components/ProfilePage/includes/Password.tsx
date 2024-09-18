import { useForm, SubmitHandler } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { updateUserPassword } from "@/services/apiUsers";
import { toast } from "react-hot-toast";
import Style from "./../profile.module.css";
import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

interface PasswordProps {
    user: {
        _id: string;
    };
}

interface FormValues {
    passwordCurrent: string;
    newPassword: string;
    passwordConfirm: string;
}

export default function Password({ user }: PasswordProps) {
    const [showPassword, setShowPassword] = useState({
        passwordCurrent: false,
        newPassword: false,
        passwordConfirm: false,
    });

    const mutation = useMutation({
        mutationFn: updateUserPassword,
        onError: (err: any) => toast.error(err.message),
        onSuccess: () => {
            toast.success("Password updated successfully!");
            reset();
        },
    });

    const isLoading = mutation.status === 'pending';

    const { register, handleSubmit, formState, reset } = useForm<FormValues>();
    const { errors } = formState;

    const dataSubmit: SubmitHandler<FormValues> = (data) => {
        mutation.mutate({ ...data, id: user._id });
    };

    const togglePasswordVisibility = (field: keyof typeof showPassword) => {
        setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
    };

    return (
        <div className={Style.passwordChange}>
            <h2>Update Password</h2>
            <form onSubmit={handleSubmit(dataSubmit)}>
                <div className={Style.inputBox}>
                    <label htmlFor="passwordCurrent">Current password</label>
                    <div className={Style.passInput}>
                    <input
                        type={showPassword.passwordCurrent ? "text" : "password"}
                        id="passwordCurrent"
                        {...register("passwordCurrent", { required: "This field is required" })}
                    />
                    <button
                        type="button"
                        onClick={() => togglePasswordVisibility('passwordCurrent')}
                        className={Style.toggleButton}
                    >
                        {showPassword.passwordCurrent ? <FaEye /> : <FaEyeSlash />}
                    </button>
                    <p>{errors?.passwordCurrent?.message}</p>
                    </div>
                </div>
                <div className={Style.inputBox}>
                    <label htmlFor="newPassword">New password</label>
                    <div className={Style.passInput}>
                    <input
                        type={showPassword.newPassword ? "text" : "password"}
                        id="newPassword"
                        {...register("newPassword", { required: "This field is required" })}
                    />
                    <button
                        type="button"
                        onClick={() => togglePasswordVisibility('newPassword')}
                        className={Style.toggleButton}
                    >
                        {showPassword.newPassword ?  <FaEye /> : <FaEyeSlash />}
                    </button>
                    <p>{errors?.newPassword?.message}</p>
                    </div>
                </div>
                <div className={Style.inputBox}>
                    <label htmlFor="passwordConfirm">Confirm password</label>
                    <div className={Style.passInput}>
                    <input
                        type={showPassword.passwordConfirm ? "text" : "password"}
                        id="passwordConfirm"
                        {...register("passwordConfirm", { required: "This field is required" })}
                    />
                    <button
                        type="button"
                        onClick={() => togglePasswordVisibility('passwordConfirm')}
                        className={Style.toggleButton}
                    >
                        {showPassword.passwordConfirm ?  <FaEye /> : <FaEyeSlash />}
                    </button>
                    <p>{errors?.passwordConfirm?.message}</p>
                    </div>
                </div>
                <div className={Style.btn}>
                    <button type="submit" disabled={isLoading}> Save </button>
                </div>
            </form>
        </div>
    );
}
