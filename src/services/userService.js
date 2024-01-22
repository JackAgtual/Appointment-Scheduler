import bcrypt from 'bcrypt'
import { User } from '../models/user.js'

export class UserService {
  static async userDoesNotExist(req, res, next) {
    const { email } = req.body
    const userExists = await User.exists({ email })

    if (!userExists) {
      next()
    } else {
      res.status(400).json({ message: `${email} already exists.` })
    }
  }

  static async userDoesExist(req, res, next) {
    const { email } = req.body
    const userExits = await User.exists({ email })

    if (userExits) {
      next()
    } else {
      res.status(400).json({ message: `${email} does not exist` })
    }
  }

  static async create({ email, orderNumber, plainTextPassword }) {
    const saltRounds = 10
    const salt = await bcrypt.genSalt(saltRounds)
    const hash = await bcrypt.hash(plainTextPassword, salt)

    return User.create({
      email,
      orderNumber,
      hashedPassword: hash,
      salt,
    })
  }

  static async validateCredentials(req, res, next) {
    const { email, password: plainTextPassword } = req.headers

    const { salt, hashedPassword } = await User.findOne({ email }, 'salt hashedPassword')
    const testHash = await bcrypt.hash(plainTextPassword, salt)
    if (testHash === hashedPassword) {
      next()
    } else {
      res.status(401).json({ message: 'Invalid credentials' })
    }
  }
}
