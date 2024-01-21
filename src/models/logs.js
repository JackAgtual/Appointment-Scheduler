import mongoose from 'mongoose'
import { emailSchema } from './sharedSchema.js'

const logsSchema = new mongoose.Schema({
  email: emailSchema,
  date: { type: Date, required: true },
  currentAppointment: { type: Date, required: true },
  bestAppointmentFound: { type: Date, required: true },
})

export const Logs = mongoose.model('Logs', logsSchema)
