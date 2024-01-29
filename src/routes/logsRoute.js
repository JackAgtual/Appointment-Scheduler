import { Router } from 'express'
import { UserService } from '../services/userService.js'
import { LogsService } from '../services/logsService.js'

const route = Router()

route.use(UserService.userDoesExist)
route.use(UserService.validateCredentials)

route.get('/', async (req, res) => {
  const { email } = req.query

  try {
    const logs = await LogsService.getLogs(email)
    res.json(logs)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default route
