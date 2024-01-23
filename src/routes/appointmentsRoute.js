import { Router } from 'express'
import { AppointmentService } from '../services/appointmentService.js'
import { UserService } from '../services/userService.js'

const route = Router()

route.get(
  '/',
  [
    UserService.userDoesExist,
    UserService.validateCredentials,
    UserService.userIsEnrolled,
  ],
  async (req, res) => {
    const { email, password } = req.body
    const orderNumber = await UserService.getOrderNumber(email)

    try {
      const betterAppointment = await AppointmentService.findAppointment({
        email,
        password,
        orderNumber,
      })
      if (betterAppointment === null) {
        res.status(404).json({ message: 'Better appointment not found' })
      } else {
        res.json(betterAppointment)
      }
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  },
)

export default route
