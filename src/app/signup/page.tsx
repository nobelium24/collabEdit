"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Requests } from "@/services/requests";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AxiosError } from "axios";

export default function SignupPage() {
    const request = new Requests();
    const { signUp } = request;
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const formik = useFormik({
        initialValues: {
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
        validationSchema: Yup.object({
            firstName: Yup.string().required("First name is required"),
            lastName: Yup.string().required("Last name is required"),
            email: Yup.string()
                .email("Invalid email address")
                .required("Email is required"),
            password: Yup.string()
                .min(8, "Password must be at least 8 characters")
                .matches(/[a-z]/, "At least one lowercase letter")
                .matches(/[A-Z]/, "At least one uppercase letter")
                .matches(/[0-9]/, "At least one number")
                .required("Password is required"),
            confirmPassword: Yup.string()
                .oneOf([Yup.ref("password")], "Passwords must match")
                .required("Please confirm your password"),
        }),
        onSubmit: async (values) => {
            console.log(values);
            try {
                const response = await signUp(values);
                console.log("Signup successful:", response);
                toast.success("Signup successful! ");
                router.push("/login");
            } catch (error: unknown) {
                const axiosError = error as AxiosError;
                console.error("Login failed:", axiosError);
                setIsLoading(false);
                if (axiosError.response &&
                    axiosError.response.data &&
                    (axiosError.response.data as { message?: string }).message) {
                    toast.error(
                        (axiosError.response.data as { message?: string }).message ||
                        "Login failed. Please try again."
                    );
                } else {
                    toast.error("An unexpected error occurred. Please try again.");
                }
            }
        },
    });

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-[#f0f4f8] px-4">
            <Card className="w-full max-w-md shadow-xl border-0">
                <CardHeader>
                    <h1 className="text-2xl font-bold text-gray-800">Create Account</h1>
                    <p className="text-sm text-gray-500">Sign up to collaborate in real-time.</p>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4" onSubmit={formik.handleSubmit} noValidate>
                        <div className="space-y-1">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input id="firstName" type="text" {...formik.getFieldProps("firstName")} />
                            {formik.touched.firstName && formik.errors.firstName && (
                                <p className="text-sm text-red-500">{formik.errors.firstName}</p>
                            )}
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input id="lastName" type="text" {...formik.getFieldProps("lastName")} />
                            {formik.touched.lastName && formik.errors.lastName && (
                                <p className="text-sm text-red-500">{formik.errors.lastName}</p>
                            )}
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" {...formik.getFieldProps("email")} />
                            {formik.touched.email && formik.errors.email && (
                                <p className="text-sm text-red-500">{formik.errors.email}</p>
                            )}
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" {...formik.getFieldProps("password")} />
                            {formik.touched.password && formik.errors.password && (
                                <p className="text-sm text-red-500">{formik.errors.password}</p>
                            )}
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input id="confirmPassword" type="password" {...formik.getFieldProps("confirmPassword")} />
                            {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                                <p className="text-sm text-red-500">{formik.errors.confirmPassword}</p>
                            )}
                        </div>
                        <Button type="submit" className="w-full bg-gray-800 text-white hover:bg-gray-700">
                            Sign Up
                        </Button>
                    </form>
                    <p className="text-center text-sm text-gray-500 mt-4">
                        Already have an account?{' '}
                        <Link href="/login" className="text-gray-800 underline hover:text-gray-600">
                            Sign in
                        </Link>
                    </p>

                    <div className="mt-6 text-center">
                        <Link href="/" passHref>
                            <Button variant="ghost">Go to Home</Button>
                        </Link>
                    </div>

                </CardContent>
            </Card>
        </div>
    );
}
