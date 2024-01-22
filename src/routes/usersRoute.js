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

export default route
