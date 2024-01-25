import crypto from 'crypto'
import dotenv from 'dotenv'
dotenv.config()

const key = process.env.CRYPTO_KEY
const encryptionMethod = 'aes-256-cbc'

export class CryptoService {
  static encrypt(message) {
    const iv = crypto.randomBytes(16).toString('hex')
    const cipher = crypto.createCipheriv(
      encryptionMethod,
      Buffer.from(key, 'hex'),
      Buffer.from(iv, 'hex'),
    )
    let encrypted = cipher.update(message, 'utf-8', 'hex')
    encrypted += cipher.final('hex')
    return { encrypted, iv }
  }

  static decrypt(encryptedMessage, iv) {
    const decipher = crypto.createDecipheriv(
      encryptionMethod,
      Buffer.from(key, 'hex'),
      Buffer.from(iv, 'hex'),
    )
    let decrypted = decipher.update(encryptedMessage, 'hex', 'utf-8')
    decrypted += decipher.final('utf-8')
    return decrypted
  }
}
