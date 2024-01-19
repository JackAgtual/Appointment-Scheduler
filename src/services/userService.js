import bcrypt from 'bcrypt'
import { User } from '../models/user.js'

export class UserService {
  static async #hashPassword(plainTextPassword, saltRounds = 10) {
    const salt = await bcrypt.genSalt(saltRounds)
    const hash = await bcrypt.hash(plainTextPassword, salt)
    return { hash, salt }
  }

  static async #validatePassword({ plainTextPassword, hashedPassword, salt }) {
    const testHash = await bcrypt.hash(plainTextPassword, salt)
    return testHash === hashedPassword
  }

  static async userExists(email) {
    const usersWithEmail = await User.find({ email })
    return usersWithEmail.length > 0
  }

  static async create({ email, orderNumber, plainTextPassword }) {
    const { hash, salt } = await this.#hashPassword(plainTextPassword)

    return User.create({
      email,
      orderNumber,
      hashedPassword: hash,
      salt,
    })
  }

  static async validateCredentials({ email, plainTextPassword }) {
    const { salt, hashedPassword } = await User.findOne({ email }, 'salt hashedPassword')
    return this.#validatePassword({
      plainTextPassword,
      hashedPassword,
      salt,
    })
  }
}
