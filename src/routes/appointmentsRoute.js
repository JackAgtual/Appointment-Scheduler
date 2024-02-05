import { Router } from 'express'
import { AppointmentService } from '../services/appointmentService.js'
import { UserService } from '../services/userService.js'

const route = Router()

route.get('/all-users', async (req, res) => {
  try {
    const availableAppointments = await AppointmentService.findAppointments(
      new Date('8/5/24').valueOf(), // FIXME: hard coding to test
    )
    // await AppointmentService.findAppointmentsAndLogAllUsers()
    console.log(availableAppointments)
    res.json(availableAppointments)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default route
