import mongoose from 'mongoose'
import { emailSchema } from './sharedSchema.js'

const userSchema = new mongoose.Schema({
  email: emailSchema,
  orderNumber: { type: String, required: true },
  encryptedPassword: { type: String, required: true },
  iv: { type: String, required: true },
  enrolled: { type: Boolean, required: true, default: true },
})

export const User = mongoose.model('User', userSchema)
