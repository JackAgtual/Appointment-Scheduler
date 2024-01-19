import { Router } from 'express'
import { UserService } from '../services/userService.js'

const route = Router()

route.post('/create', async (req, res) => {
  const { email, orderNumber, password } = req.body

  if (await UserService.userExists(email)) {
    res.status(400).json({ message: `${email} already exists.` })
    return
  }

  try {
    const newUser = await UserService.create({
      email,
      orderNumber,
      plainTextPassword: password,
    })
    res.status(201).json(newUser)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

route.get('/validate', async (req, res) => {
  const { email, password: plainTextPassword } = req.body

  try {
    const userIsValid = await UserService.validateCredentials({
      email,
      plainTextPassword,
    })
    console.log({ userIsValid })
    if (userIsValid) {
      res.status(200).json({
        validated: true,
      })
    } else {
      res.status(401).json({
        validated: false,
      })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default route
