import { Router } from 'express'
import { UserService } from '../services/userService.js'

const route = Router()

route.post('/create', UserService.userDoesNotExist, async (req, res) => {
  const { email, orderNumber, password } = req.body

  try {
    const newUser = await UserService.create({
      email,
      orderNumber,
      plainTextPassword: password,
      enrolled: true,
    })
    res.status(201).json(newUser)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

route.get(
  '/validate',
  [UserService.userDoesExist, UserService.validateCredentials],
  async (req, res) => {
    res.sendStatus(200)
  },
)

route.patch(
  '/enrollment',
  [UserService.userDoesExist, UserService.validateCredentials],
  async (req, res) => {
    const { enrolled, email } = req.body

    try {
      const user = await UserService.patchEnrollment({ enrolled, email })
      res.json(user)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  },
)

route.patch(
  '/notification-frequency',
  [UserService.userDoesExist, UserService.validateCredentials],
  async (req, res) => {
    const { email, notificationFrequency } = req.body

    try {
      const user = await UserService.patchNotificationFrequency({
        email,
        notificationFrequency,
      })
      res.json(user)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  },
)

route.get(
  '/last-query-time',
  [UserService.userDoesExist, UserService.validateCredentials],
  async (req, res) => {
    const { email } = req.query
    try {
      const timeLastQuery = await UserService.getLastNotificationTime(email)
      res.json({ time: timeLastQuery })
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  },
)

export default route
