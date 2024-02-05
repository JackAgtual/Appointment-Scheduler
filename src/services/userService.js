import { User } from '../models/user.js'
import { CryptoService } from './cryptoService.js'
import { AppointmentService } from './appointmentService.js'

export class UserService {
  static #getCredentialsFromRequest(req) {
    const { email, password } = req.method === 'GET' ? req.query : req.body
    return { email, password }
  }

  static async userDoesNotExist(req, res, next) {
    const { email } = UserService.#getCredentialsFromRequest(req)
    const userExists = await User.exists({ email })

    if (!userExists) {
      next()
    } else {
      res.status(400).json({ message: `${email} already exists.`, invalidInput: 'email' })
    }
  }

  static async userDoesExist(req, res, next) {
    const { email } = UserService.#getCredentialsFromRequest(req)
    const userExits = await User.exists({ email })

    if (userExits) {
      next()
    } else {
      res.status(400).json({ message: `${email} does not exist`, invalidInput: 'email' })
    }
  }

  static async create({ email, orderNumber, plainTextPassword }) {
    const { credentialsAreValid, errorMessage } =
      await AppointmentService.validateCredentials({
        email,
        orderNumber,
        password: plainTextPassword,
      })

    if (!credentialsAreValid) {
      console.log({ errorMessage })
      throw new Error(errorMessage)
    }

    const { encrypted: encryptedPassword, iv } = CryptoService.encrypt(plainTextPassword)

    const appointmentDate = await AppointmentService.getCurrentAppointmentDate({
      orderNumber,
      email,
      password: plainTextPassword,
    })

    return User.create({
      email,
      orderNumber,
      encryptedPassword,
      iv,
      appointmentDate,
    })
  }

  static async validateCredentials(req, res, next) {
    const { email, password } = UserService.#getCredentialsFromRequest(req)
    const { encryptedPassword, iv } = await User.findOne(
      { email },
      'encryptedPassword iv',
    )
    const actualPassword = CryptoService.decrypt(encryptedPassword, iv)
    if (password === actualPassword) {
      next()
    } else {
      res.status(403).json({ message: 'Incorrect password', invalidInput: 'password' })
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

  static async getAllEnrolledUsers() {
    return User.find({ enrolled: true })
  }

  static async getPassword(user) {
    const { encryptedPassword, iv } = user
    return CryptoService.decrypt(encryptedPassword, iv)
  }

  static async getLatestAppointmentOfEnrolledUsers() {
    return User.findOne({ enrolled: true })
      .sort('-appointmentDate')
      .limit(1)
      .select('appointmentDate')
  }

  static async updateQueryTime() {
    const udpateTime = new Date()
    User.updateQueryTime(udpateTime)
  }
}
