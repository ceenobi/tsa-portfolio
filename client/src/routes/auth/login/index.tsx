import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { type AuthResponse, loginSchema } from "@tsa/shared";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { toast } from "react-toastify";
import type { z } from "zod";
import ActionBtn from "@/components/ui/action-btn";
import { FormBox } from "@/components/ui/form-box";
import { api } from "@/lib/api";

export default function Login() {
	const [isVisible, setIsVisible] = useState<boolean>(false);
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<z.infer<typeof loginSchema>>({
		resolver: zodResolver(loginSchema),
		mode: "onChange",
	});

	const navigate = useNavigate();

	const mutation = useMutation({
		mutationFn: (data: z.infer<typeof loginSchema>) => {
			return api.post<AuthResponse["body"]>("/auth/login", data);
		},
		onSuccess: (res) => {
			if (res.success) {
				toast.success("Login successful");
				navigate(`/dashboard`);
			}
		},
		onError: (err) => {
			if (import.meta.env.DEV) console.error("err", err);
			toast.error(err.message);
		},
	});

	const onSubmit = (data: z.infer<typeof loginSchema>) => {
		mutation.mutate(data);
	};

	return (
		<div className="space-y-8 w-full max-w-[85vw]">
			<div className="mt-4 space-y-1">
				<h1 className="text-xl sm:text-2xl md:text-[28px] font-semibold">
					Welcome Back
				</h1>
				<p className="text-sm md:text-base text-mainGray">
					Sign in to access the Admin Dashboard
				</p>
			</div>
			<form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full">
				<FormBox
					label="Email"
					type="email"
					placeholder="email@example.com"
					id="email"
					register={register}
					errors={errors?.email}
					name="email"
				/>
				<div>
					<FormBox
						label="Password"
						type="password"
						placeholder="********"
						id="password"
						register={register}
						errors={errors?.password}
						name="password"
						isVisible={isVisible}
						setIsVisible={setIsVisible}
					/>
					<Link
						to="/auth/forgot-password"
						className="text-sm font-semibold text-deepBlue hover:underline"
					>
						Forgot Password?
					</Link>
				</div>
				<ActionBtn
					text="Login"
					type="submit"
					loading={mutation.isPending}
					classname="w-full h-12 text-base bg-mainBlue hover:bg-mainBlue/90"
				/>
			</form>
			<div className="flex items-center justify-center gap-2 mt-10">
				<p className="text-[13px] text-muted-foreground">
					Don't have an account?{" "}
					<Link
						to="/auth/register"
						className="font-semibold text-mainBlue dark:text-white hover:underline"
					>
						Create an Account
					</Link>
				</p>
			</div>
		</div>
	);
}
