import { Log } from '../models/log.js'

export class LogsService {
  static async getLogs(email) {
    return Log.find({ email })
  }

  static async create({ email, currentAppointment, bestAppointmentFound }) {
    const data = { email, currentAppointment, date: Date.now() }
    if (bestAppointmentFound !== null) {
      data.bestAppointmentFound = bestAppointmentFound
    }
    return Log.create(data)
  }
}
