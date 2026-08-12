import ActionBtn from "@/components/ui/action-btn";
import { FormBox } from "@/components/ui/form-box";
import { api } from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { resendOtpSchema, verifyEmailSchema, type ResendOtpResponse, type VerifyEmailResponse } from "@tsa/shared";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "react-toastify";
import { z } from "zod";


export default function VerifyAccount() {
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') || ''
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<z.infer<typeof verifyEmailSchema>>({
    resolver: zodResolver(verifyEmailSchema),
    mode: "onChange",
  });
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: (data: z.infer<typeof verifyEmailSchema>) => {
      return api.post<VerifyEmailResponse['body']>(`/auth/verify-account?email=${email}`, data)
    },
    onSuccess: res => {
      if (res.success) {
        toast.success(res.message || 'Email verified successfully')
        navigate(`/`)
      }
    },
    onError: err => {
      if (import.meta.env.DEV) console.error('err', err)
      toast.error(err.message)
    },
  })

  const retryOtp = useMutation({
    mutationFn: (data: z.infer<typeof resendOtpSchema>) => {
      return api.post<ResendOtpResponse['body']>(`/auth/resend-otp`, data)
    },
    onSuccess: res => {
      if (res.success) {
        toast.success(res.body.message || 'OTP resent successfully')
      }
    },
    onError: err => {
      if (import.meta.env.DEV) console.error('err', err)
      toast.error(err.message)
    },
  })

  const onSubmit = (data: z.infer<typeof verifyEmailSchema>) => {
    mutation.mutate(data)
  };



  return (
    <div className="space-y-8">
      <div className="mt-4 space-y-1">
        <h1 className="text-xl sm:text-2xl md:text-[28px] font=semibold">Verify Account</h1>
        <p className="text-sm md:text-base text-mainGray">Enter the verification code sent to your email.</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormBox
          label="Verification Code"
          type="text"
          placeholder="Enter verification code"
          id="otp"
          register={register}
          errors={errors?.otp}
          name="otp"
          inputType="otp"
          control={control}
        />
        <ActionBtn
          text="Verify"
          type="submit"
          loading={mutation.isPending}
          classname="w-full h-12 text-base bg-mainBlue hover:bg-mainBlue/90"
        />
      </form>
      <div className="w-full inline-flex gap-2 justify-center items-center">
        <p className="text-sm">Did not receive the code? </p>
        <a
          href="#"
          className="text-mainGreen text-sm"
          onClick={e => {
            e.preventDefault()
            retryOtp.mutate({ email })
          }}
        >
          {retryOtp.isPending ? 'Resending...': 'Resend'}
        </a>
      </div>
    </div>
  );
}
