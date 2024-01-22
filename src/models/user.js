import mongoose from 'mongoose'
import { emailSchema } from './sharedSchema.js'

const userSchema = new mongoose.Schema({
  email: emailSchema,
  orderNumber: { type: String, required: true },
  hashedPassword: { type: String, required: true },
  salt: { type: String, required: false },
  enrolled: { type: Boolean, required: true, default: true },
})

export const User = mongoose.model('User', userSchema)
