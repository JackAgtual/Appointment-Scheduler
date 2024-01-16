import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true },
  orderNumber: { type: String, required: true },
  hashedPassword: { type: String, required: true },
})

export const User = mongoose.model('User', userSchema)
