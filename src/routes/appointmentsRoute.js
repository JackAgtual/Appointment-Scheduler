import { Router } from 'express'
import { AppointmentService } from '../services/appointmentService.js'
import { UserService } from '../services/userService.js'
import { LogsService } from '../services/logsService.js'

const route = Router()

route.get(
  '/user',
  [
    UserService.userDoesExist,
    UserService.validateCredentials,
    UserService.userIsEnrolled,
  ],
  async (req, res) => {
    const { email, password } = req.body
    const orderNumber = await UserService.getOrderNumber(email)

    try {
      const { bestAppointment, currentAppointment } =
        await AppointmentService.findAppointment({
          email,
          password,
          orderNumber,
        })

      if (bestAppointment === null) {
        res.status(404).json({ message: 'Better appointment not found' })
      } else {
        res.json(bestAppointment)
      }

      LogsService.create({
        email,
        currentAppointment,
        bestAppointmentFound: bestAppointment,
      })
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  },
)

export default route
