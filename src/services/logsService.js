import { Log } from '../models/log.js'

export class LogsService {
  static async getLogs(email) {
    return Log.find({ email })
  }

  static async create({ email, currentAppointment, bestAppointmentFound }) {
    return Log.create({
      email,
      currentAppointment,
      bestAppointmentFound,
      date: Date.now(),
    })
  }
}
