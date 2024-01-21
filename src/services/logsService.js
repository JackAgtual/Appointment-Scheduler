import { Logs } from '../models/logs.js'

export class LogsService {
  static async getLogs(email) {
    return Logs.find({ email })
  }

  static async create({ email, currentAppointment, bestAppointmentFound }) {
    return Logs.create({
      email,
      currentAppointment,
      bestAppointmentFound,
      date: Date.now(),
    })
  }
}
