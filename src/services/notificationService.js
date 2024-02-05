import { Notification } from '../models/notification.js'
import { EmailService } from './emailService.js'
import { UserService } from './userService.js'

export class NotificationService {
  static async #userReadyToBeNotified(email) {
    const notificationFrequency = await UserService.getNotificationFrequency(email)
    const lastNotification = await Notification.findOne({ email }).sort('-time')

    if (!lastNotification) return true

    const timeSinceLastNotification = Date.now() - lastNotification.time

    console.log({
      tElapsed: timeSinceLastNotification / 1000,
      tLastNotif: new Date(lastNotification.time),
      t: new Date(),
      ready: timeSinceLastNotification > notificationFrequency,
    })

    return timeSinceLastNotification > notificationFrequency
  }

  static async notify({
    email,
    currentAppointmentDate,
    betterAppointmentDate,
    orderNumber,
  }) {
    const userReadyForNotification = await NotificationService.#userReadyToBeNotified(
      email,
    )

    if (!userReadyForNotification) return

    const notif = await Notification.create({ email })

    EmailService.send({
      recipient: email,
      currentAppointmentDate,
      betterAppointmentDate,
      orderNumber,
    })
  }
}
