import { Router } from 'express'
import { User } from '../models/user.js'

const route = Router()

route.post('/create', async (req, res) => {
  const user = new User({
    orderNumber: req.body.orderNumber,
    email: req.body.email,
    password: req.body.password,
  })

  try {
    const newUser = await user.save()
    res.status(201).json(newUser)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

export default route
