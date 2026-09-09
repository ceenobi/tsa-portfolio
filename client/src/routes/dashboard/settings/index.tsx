import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { GetUserResponse, UserProfile } from "@tsa/shared";
import { updateEmailSchema, updatePasswordSchema } from "@tsa/shared";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import type { z } from "zod";
import ActionBtn from "@/components/ui/action-btn";
import { FormBox } from "@/components/ui/form-box";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/utils";
import { getSessionQuery } from "@/middleware/auth";

type EmailForm = z.infer<typeof updateEmailSchema>;
type PasswordForm = z.infer<typeof updatePasswordSchema>;

export default function Settings() {
	const navigate = useNavigate();
	const [emailVisible, setEmailVisible] = useState(false);
	const [passwordVisible, setPasswordVisible] = useState(false);
	const [currentPasswordVisible, setCurrentPasswordVisible] = useState(false);

	const { data: user } = useQuery(getSessionQuery());
	const isSuperAdmin = user?.role === "super_admin";

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
					<h1 className="text-2xl font-bold">Account</h1>
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

			{/* Manage Users — super_admin only */}
			{isSuperAdmin && <ManageUsersSection currentUser={user!} />}
		</div>
	);
}

function ManageUsersSection({ currentUser }: { currentUser: UserProfile }) {
	const queryClient = useQueryClient();

	const { data: users, isLoading } = useQuery({
		queryKey: ["users"],
		queryFn: async () => {
			const res = await api.get<GetUserResponse["body"][]>("/auth/users");
			return res.body || [];
		},
	});

	const promoteMutation = useMutation({
		mutationFn: (userId: string) => {
			return api.patch(`/auth/users/${userId}/role`, { role: "super_admin" });
		},
		onSuccess: (res) => {
			if (res.success) {
				toast.success(res.message);
				queryClient.invalidateQueries({ queryKey: ["users"] });
			}
		},
		onError: (err) => {
			toast.error(err.message);
		},
	});

	return (
		<div className="rounded-lg border bg-white p-6">
			<div className="space-y-2">
				<h2 className="text-2xl font-semibold">Manage Users</h2>
				<p>Promote admin users to super_admin</p>
			</div>

			<div className="mt-4">
				{isLoading ? (
					<p className="text-sm text-muted-foreground">Loading users...</p>
				) : !users || users.length === 0 ? (
					<p className="text-sm text-muted-foreground">No users found.</p>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead>
								<tr className="border-b text-left text-muted-foreground">
									<th className="pb-3 font-medium">Email</th>
									<th className="pb-3 font-medium">Role</th>
									<th className="pb-3 font-medium">Joined</th>
									<th className="pb-3 font-medium text-right">Action</th>
								</tr>
							</thead>
							<tbody>
								{users.map((u) => (
									<tr key={u._id} className="border-b last:border-0">
										<td className="py-3">{u.email}</td>
										<td className="py-3">
											<span
												className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
													u.role === "super_admin"
														? "bg-purple-100 text-purple-700"
														: "bg-gray-100 text-gray-700"
												}`}
											>
												{u.role}
											</span>
										</td>
										<td className="py-3 text-muted-foreground">
											{u.createdAt
												? new Date(u.createdAt).toLocaleDateString()
												: "—"}
										</td>
										<td className="py-3 text-right">
											{u._id === currentUser._id ? (
												<span className="text-xs text-muted-foreground">
													You
												</span>
											) : u.role === "super_admin" ? (
												<span className="text-xs text-muted-foreground">—</span>
											) : (
												<button
													type="button"
													onClick={() => promoteMutation.mutate(u._id)}
													disabled={promoteMutation.isPending}
													className="rounded bg-mainBlue px-3 py-1 text-xs text-white hover:bg-mainBlue/90 disabled:opacity-50"
												>
													{promoteMutation.isPending
														? "Promoting..."
														: "Promote"}
												</button>
											)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</div>
	);
}
