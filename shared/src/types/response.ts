export type ApiSuccessResponse<TBody = undefined> = {
  success: true
  message: string
} & (TBody extends undefined ? {} : { body: TBody })

export type ApiErrorResponse<TDetails = undefined> = {
  success: false
  message: string
} & (TDetails extends undefined ? {} : { details: TDetails })
