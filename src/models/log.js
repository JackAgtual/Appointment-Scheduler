import mongoose from 'mongoose'
import { emailSchema } from './sharedSchema.js'

const logSchema = new mongoose.Schema({
  email: emailSchema,
  date: { type: Date, required: true },
  currentAppointment: { type: Date, required: true },
  bestAppointmentFound: { type: Date, required: true },
})

export const Log = mongoose.model('Logs', logSchema)
