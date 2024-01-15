import { User } from '../models/user.js'

export class UserService {
  static async userExists(email) {
    const usersWithEmail = await User.find({ email })
    return usersWithEmail.length > 0
  }
}
