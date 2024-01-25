import { User } from '../models/user.js'
import { CryptoService } from './cryptoService.js'

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
    const { encrypted: encryptedPassword, iv } = CryptoService.encrypt(plainTextPassword)

    return User.create({
      email,
      orderNumber,
      encryptedPassword,
      iv,
    })
  }

  static async validateCredentials(req, res, next) {
    const { email, password } = req.body

    const { encryptedPassword, iv } = await User.findOne(
      { email },
      'encryptedPassword iv',
    )
    const actualPassword = CryptoService.decrypt(encryptedPassword, iv)
    if (password === actualPassword) {
      next()
    } else {
      res.status(401).json({ message: 'Invalid credentials' })
    }
  }

  static async patchEnrollment({ enrolled, email }) {
    const user = await User.findOne({ email })
    user.enrolled = enrolled
    await user.save()
    return user
  }

  static async getOrderNumber(email) {
    const { orderNumber } = await User.findOne({ email }, 'orderNumber')
    return orderNumber
  }

  static async userIsEnrolled(req, res, next) {
    const { email } = req.body
    const { enrolled } = await User.findOne({ email }, 'enrolled')
    if (enrolled) {
      next()
    } else {
      res.status(400).json({ message: `${email} is not enrolled` })
    }
  }
}
