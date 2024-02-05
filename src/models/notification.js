import mongoose from 'mongoose'
import { emailSchema } from './sharedSchema.js'

const notificationSchema = new mongoose.Schema({
  email: emailSchema,
  time: { type: Number, required: true, default: Date.now() },
})

export const Notification = mongoose.model('Notification', notificationSchema)
