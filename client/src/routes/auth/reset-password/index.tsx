import ActionBtn from "@/components/ui/action-btn";
import { FormBox } from "@/components/ui/form-box";
import { api } from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { resetPasswordSchema, type ResetPasswordResponse } from "@tsa/shared";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "react-toastify";
import { z } from "zod";

const ResetPasswordSchema = resetPasswordSchema.extend({
  confirmPassword: z.string({ message: 'Complete this field to continue' }).min(8, {
    message: 'Password must be at least 8 characters long',
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Password and Confirm password are not a match',
  path: ['confirmPassword'],
});


export default function ResetPassword() {
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const [isConfirm, setIsConfirm] = useState<boolean>(false)
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof ResetPasswordSchema>>({
    resolver: zodResolver(ResetPasswordSchema),
    mode: 'onChange',
  })
const navigate = useNavigate()
const mutation = useMutation({
    mutationFn: (data: z.infer<typeof ResetPasswordSchema>) => {
      return api.post<ResetPasswordResponse['body']>(`/auth/reset-password?token=${token}`, data)
    },
    onSuccess: res => {
      if (res.success) {
        toast.success(res.message || 'Password reset successful')
        navigate(`/auth/login`)
      }
    },
    onError: err => {
      if (import.meta.env.DEV) console.error('err', err)
      toast.error(err.message)
    },
  })

  const onSubmit = (data: z.infer<typeof ResetPasswordSchema>) => {
    mutation.mutate(data)
  };

  return (
    <div className="space-y-8">
      <div className="mt-4 space-y-1">
        <h1 className="text-xl sm:text-2xl md:text-[28px] font=semibold">Reset Password</h1>
        <p className="text-sm md:text-base text-mainGray"> Choose a strong password you haven't used before. Make it at least 8 characters.</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormBox
          label="New Password"
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
    </div>
  );
}
