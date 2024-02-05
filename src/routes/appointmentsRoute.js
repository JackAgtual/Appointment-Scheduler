import { Router } from 'express'
import { AppointmentService } from '../services/appointmentService.js'

const route = Router()

route.get('/all-users', async (req, res) => {
  try {
    await AppointmentService.findAppointmentsForAllUsers()
    res.send()
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default route
