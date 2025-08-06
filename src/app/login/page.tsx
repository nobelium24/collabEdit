"use client";

import { useFormik } from "formik";
import * as Yup from "yup";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Requests } from "@/services/requests";

const validationSchema = Yup.object({
    email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
    password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
});

export default function LoginPage() {
    const request = new Requests();

    const { signIn } = request;
    const router = useRouter();

    const formik = useFormik({
        initialValues: {
            email: "",
            password: "",
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                const response = await signIn(values);

                toast.success(`Welcome ${response.user.name}`);
                const redirectPath = "/dashboard";
                router.push(redirectPath, {
                    scroll: false
                });
            } catch (error) {
                console.error("Login failed:", error);
                toast.error("Login failed. Please try again.");
            }
        },
    });

    return (
        <div className="flex items-center justify-center min-h-screen bg-background px-4">
            <Card className="w-full max-w-md shadow-md border border-border bg-white dark:bg-gray-900">
                <CardHeader className="text-center space-y-2">
                    <h2 className="text-2xl font-bold text-primary">Log In</h2>
                    <p className="text-sm text-muted-foreground">
                        Welcome back! Enter your credentials to continue.
                    </p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={formik.handleSubmit} className="space-y-6">
                        {/* Email */}
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="you@example.com"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.email}
                            />
                            {formik.touched.email && formik.errors.email ? (
                                <p className="text-sm text-red-500 mt-1">{formik.errors.email}</p>
                            ) : null}
                        </div>

                        {/* Password */}
                        <div>
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.password}
                            />
                            {formik.touched.password && formik.errors.password ? (
                                <p className="text-sm text-red-500 mt-1">{formik.errors.password}</p>
                            ) : null}
                        </div>

                        {/* Submit */}
                        <Button type="submit" className="w-full">
                            Log In
                        </Button>
                    </form>

                    <p className="mt-4 text-sm text-center text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <Link href="/signup" className="text-primary underline hover:text-primary/80">
                            Sign up
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
