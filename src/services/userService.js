import bcrypt from 'bcrypt'
import { User } from '../models/user.js'

export class UserService {
  static async userExists(email) {
    const usersWithEmail = await User.find({ email })
    return usersWithEmail.length > 0
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

  static async validateCredentials({ email, plainTextPassword }) {
    const { salt, hashedPassword } = await User.findOne({ email }, 'salt hashedPassword')
    const testHash = await bcrypt.hash(plainTextPassword, salt)
    return testHash === hashedPassword
  }
}
