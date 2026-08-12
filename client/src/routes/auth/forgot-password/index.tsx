import ActionBtn from "@/components/ui/action-btn";
import { FormBox } from "@/components/ui/form-box";
import { api } from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { forgotPasswordSchema, type ForgotPasswordResponse } from "@tsa/shared";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import { toast } from "react-toastify";
import { z } from "zod";
export default function ForgotPassword() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onChange",
  });

  const mutation = useMutation({
    mutationFn: (data: z.infer<typeof forgotPasswordSchema>) => {
      return api.post<ForgotPasswordResponse['body']>(`/auth/forgot-password`, data)
    },
    onSuccess: res => {
      if (res.success) {
        toast.success(res.message)
        reset()
      }
    },
    onError: err => {
      if (import.meta.env.DEV) console.error('err', err)
      toast.error(err.message)
    },
  })

  const onSubmit = (data: z.infer<typeof forgotPasswordSchema>) => {
    mutation.mutate(data)
  };

  return (
    <div className="space-y-8">
      <div className="mt-4 space-y-1">
        <h1 className="text-xl sm:text-2xl md:text-[28px] font=semibold">Forgot Password</h1>
        <p className="text-sm md:text-base text-mainGray">Enter the email on your account and we’ll send you a link to reset it</p>
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
        <ActionBtn
          text="Send reset link"
          type="submit"
          loading={mutation.isPending}
          classname="w-full h-12 text-base bg-mainBlue hover:bg-mainBlue/90"
        />
      </form>
      <p className="text-xs text-center mt-2">
        <Link to="/auth/login" className="font-semibold text-mainBlue hover:underline">
          Back to Sign In
        </Link>
      </p>
    </div>
  );
}
