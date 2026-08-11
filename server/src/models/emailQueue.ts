import mongoose, { Document, Schema } from 'mongoose'

export interface IEmailQueue extends Document {
  _id: mongoose.Types.ObjectId
  to: string | string[]
  subject: string
  html: string
  priority: 'low' | 'normal' | 'high'
  status: 'queued' | 'sending' | 'sent' | 'failed'
  retryCount: number
  maxRetries: number
  lastError?: string
  lastErrorStack?: string
  nextRetryAt?: Date
  sentAt?: Date
  failedAt?: Date
  queuedAt: Date
}

const EmailQueueSchema = new Schema<IEmailQueue>(
  {
    to: {
      type: Schema.Types.Mixed,
      required: true,
      validate: {
        validator: (v: unknown) =>
          typeof v === 'string' || (Array.isArray(v) && v.every(item => typeof item === 'string')),
        message: 'to must be a string or array of strings',
      },
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    html: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high'],
      default: 'normal',
    },
    status: {
      type: String,
      enum: ['queued', 'sending', 'sent', 'failed'],
      default: 'queued',
    },
    retryCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxRetries: {
      type: Number,
      default: 5,
      min: 0,
    },
    lastError: {
      type: String,
    },
    lastErrorStack: {
      type: String,
    },
    nextRetryAt: {
      type: Date,
    },
    sentAt: {
      type: Date,
    },
    failedAt: {
      type: Date,
    },
    queuedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

// Indexes — supports the cron job query and general filtering
EmailQueueSchema.index({ status: 1, nextRetryAt: 1 })
EmailQueueSchema.index({ priority: -1, queuedAt: 1 })
EmailQueueSchema.index({ status: 1, createdAt: -1 })

const EmailQueue =
  mongoose.models.EmailQueue || mongoose.model<IEmailQueue>('EmailQueue', EmailQueueSchema, 'email_queue')

export default EmailQueue
