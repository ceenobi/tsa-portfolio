import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { type AuthResponse, registerSchema } from "@tsa/shared";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { toast } from "react-toastify";
import { z } from "zod";
import ActionBtn from "@/components/ui/action-btn";
import { FormBox } from "@/components/ui/form-box";
import { api } from "@/lib/api";

const RegisterSchema = registerSchema
	.extend({
		confirmPassword: z
			.string({ message: "Complete this field to continue" })
			.min(8, {
				message: "Password must be at least 8 characters long",
			}),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Password and Confirm password are not a match",
		path: ["confirmPassword"],
	});

export default function Register() {
	const [isVisible, setIsVisible] = useState<boolean>(false);
	const [isConfirm, setIsConfirm] = useState<boolean>(false);
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<z.infer<typeof RegisterSchema>>({
		resolver: zodResolver(RegisterSchema),
		mode: "onChange",
	});
	const navigate = useNavigate();

	const mutation = useMutation({
		mutationFn: (data: z.infer<typeof RegisterSchema>) => {
			return api.post<AuthResponse["body"]>("/auth/register", data);
		},
		onSuccess: (res) => {
			if (res.success) {
				toast.success(res?.message ?? "Account created successfully");
				navigate(`/auth/verify-account?email=${res?.body?.user?.email}`);
			}
		},
		onError: (err) => {
			if (import.meta.env.DEV) console.error("err", err);
			toast.error(err.message);
		},
	});

	const onSubmit = (data: z.infer<typeof RegisterSchema>) => {
		mutation.mutate(data);
	};

	return (
		<div className="space-y-8">
			<div className="mt-4 space-y-1">
				<h1 className="text-xl sm:text-2xl md:text-[28px] font-semibold">
					Create an Admin Account
				</h1>
				<p className="text-sm md:text-base text-mainGray">
					Register to manage the Academy Portfolio Archive
				</p>
			</div>
			<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
				<FormBox
					label="Email"
					type="email"
					placeholder="email@example.com"
					id="email"
					register={register}
					errors={errors?.email}
					name="email"
				/>
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
				<FormBox
					label="Confirm Password"
					type="password"
					placeholder="********"
					id="confirmPassword"
					register={register}
					errors={errors?.confirmPassword}
					name="confirmPassword"
					isVisible={isConfirm}
					setIsVisible={setIsConfirm}
				/>
				<ActionBtn
					text="Register"
					type="submit"
					loading={mutation.isPending}
					classname="w-full h-12 text-base bg-mainBlue hover:bg-mainBlue/90"
				/>
			</form>
			<div className="flex items-center justify-center gap-2 mt-10">
				<p className="text-[13px] text-muted-foreground">
					Already have an account?{" "}
					<Link
						to="/auth/login"
						className="font-semibold text-mainBlue hover:underline"
					>
						Login
					</Link>
				</p>
			</div>
		</div>
	);
}
