import { Request, Response } from 'express'
import { sendTsRestSuccess } from '../libs/responseHandler.js'
import tryCatchWrapper from '../libs/tryCatchWrapper.js'

export const registerAccount = tryCatchWrapper(async (req: Request, res: Response) => {
  const { name, email, password } = req.body

  // const verificationLink = `${env.CLIENT_URL}/verify-email?email=${encodeURIComponent(user.email)}`
  // await EmailService.sendVerifyAccountEmail({ user, otp, link: verificationLink })

  // logger.info({ userId: user._id }, 'New account registered')

  return sendTsRestSuccess(res, 201, {
    success: true,
    message: 'Account created. Please verify your email.',
    body: {
      user: {
        name,
        email,
        emailVerified: false,
      },
    },
  })
})
