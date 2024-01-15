import { Router } from 'express'
import { User } from '../models/user.js'
import { UserService } from '../services/userService.js'

const route = Router()

route.post('/create', async (req, res) => {
  const { email } = req.body

  const user = new User({
    orderNumber: req.body.orderNumber,
    email,
    password: req.body.password,
  })

  if (UserService.userExists(email)) {
    res.status(400).json({ message: `${email} already exists.` })
    return
  }

  try {
    const newUser = await user.save()
    res.status(201).json(newUser)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

export default route
