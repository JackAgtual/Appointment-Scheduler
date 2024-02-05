import mongoose from 'mongoose'
import { emailSchema } from './sharedSchema.js'

const userSchema = new mongoose.Schema({
  email: emailSchema,
  orderNumber: { type: String, required: true },
  encryptedPassword: { type: String, required: true },
  iv: { type: String, required: true },
  enrolled: { type: Boolean, required: true, default: true },
  appointmentDate: { type: Date, required: true },
  timeLastQuery: { type: Date, required: false, default: null },
})

userSchema.statics.updateQueryTime = async function (time) {
  const enrolledUsers = await User.find({ enrolled: true })
  for (const user of enrolledUsers) {
    user.timeLastQuery = time
    await user.save()
  }
}

export const User = mongoose.model('User', userSchema)
