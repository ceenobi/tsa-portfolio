import { useState } from "react";
import type { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { updateEmailSchema, updatePasswordSchema } from "@tsa/shared";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/utils";
import { FormBox } from "@/components/ui/form-box";
import ActionBtn from "@/components/ui/action-btn";

type EmailForm = z.infer<typeof updateEmailSchema>;
type PasswordForm = z.infer<typeof updatePasswordSchema>;

export default function Settings() {
	const navigate = useNavigate();
	const [emailVisible, setEmailVisible] = useState(false);
	const [passwordVisible, setPasswordVisible] = useState(false);
	const [currentPasswordVisible, setCurrentPasswordVisible] = useState(false);

	const emailForm = useForm<EmailForm>({
		resolver: zodResolver(updateEmailSchema),
		mode: "onChange",
	});

	const passwordForm = useForm<PasswordForm>({
		resolver: zodResolver(updatePasswordSchema),
		mode: "onChange",
	});

	const updateEmailMutation = useMutation({
		mutationFn: (data: EmailForm) => {
			return api.patch("/auth/update-email", data);
		},
		onSuccess: (res) => {
			if (res.success) {
				toast.success("Email updated. Please log in again.");
				queryClient.clear();
				navigate("/");
			}
		},
		onError: (err) => {
			if (import.meta.env.DEV) console.error("err", err);
			toast.error(err.message);
		},
	});

	const updatePasswordMutation = useMutation({
		mutationFn: (data: PasswordForm) => {
			return api.patch("/auth/update-password", data);
		},
		onSuccess: (res) => {
			if (res.success) {
				toast.success("Password updated. Please log in again.");
				queryClient.clear();
				navigate("/");
			}
		},
		onError: (err) => {
			if (import.meta.env.DEV) console.error("err", err);
			toast.error(err.message);
		},
	});

	return (
		<div className="container mx-auto space-y-8">
			<div className="flex justify-between items-center">
				<div className="space-y-2">
					<h1 className="text-2xl font-bold">Settings</h1>
					<p>Manage your academy and portfolio preferences</p>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
				{/* Email form */}
				<div className="rounded-lg border bg-white p-6">
					<div className="space-y-2">
						<h2 className="text-2xl font-semibold">Update Email</h2>
						<p>Change the email address for your account</p>
					</div>
					<form
						onSubmit={emailForm.handleSubmit((data) =>
							updateEmailMutation.mutate(data),
						)}
						className="mt-4 space-y-4"
					>
						<FormBox
							label="New Email"
							type="email"
							placeholder="email@example.com"
							id="newEmail"
							register={emailForm.register}
							errors={emailForm.formState.errors?.newEmail}
							name="newEmail"
						/>
						<FormBox
							label="Current Password"
							type="password"
							placeholder="********"
							id="emailCurrentPassword"
							register={emailForm.register}
							errors={emailForm.formState.errors?.currentPassword}
							name="currentPassword"
							isVisible={emailVisible}
							setIsVisible={setEmailVisible}
						/>
						<ActionBtn
							text="Update Email"
							type="submit"
							loading={updateEmailMutation.isPending}
							classname="w-full h-12 text-base bg-mainBlue hover:bg-mainBlue/90"
						/>
					</form>
				</div>

				{/* Password form */}
				<div className="rounded-lg border bg-white p-6">
					<div className="space-y-2">
						<h2 className="text-2xl font-semibold">Update Password</h2>
						<p>Change the password for your account</p>
					</div>
					<form
						onSubmit={passwordForm.handleSubmit((data) =>
							updatePasswordMutation.mutate(data),
						)}
						className="mt-4 space-y-4"
					>
						<FormBox
							label="Current Password"
							type="password"
							placeholder="********"
							id="passwordCurrentPassword"
							register={passwordForm.register}
							errors={passwordForm.formState.errors?.currentPassword}
							name="currentPassword"
							isVisible={currentPasswordVisible}
							setIsVisible={setCurrentPasswordVisible}
						/>
						<FormBox
							label="New Password"
							type="password"
							placeholder="********"
							id="newPassword"
							register={passwordForm.register}
							errors={passwordForm.formState.errors?.newPassword}
							name="newPassword"
							isVisible={passwordVisible}
							setIsVisible={setPasswordVisible}
						/>
						<ActionBtn
							text="Update Password"
							type="submit"
							loading={updatePasswordMutation.isPending}
							classname="w-full h-12 text-base bg-mainBlue hover:bg-mainBlue/90"
						/>
					</form>
				</div>
			</div>
		</div>
	);
}
