import axios from 'axios'
import dotenv from 'dotenv'
dotenv.config()

const SERVICE_ID = process.env.EMAIL_JS_SERVICE_ID
const TEMPLATE_ID = process.env.EMAIL_JS_TEMPLATE_ID
const PUBLIC_KEY = process.env.EMAIL_JS_USER_ID
const PRIVATE_KEY = process.env.EMAIL_JS_PRIVATE_KEY

export class EmailService {
  static async send({ recipient, currentDate, betterDate, orderNumber }) {
    const data = {
      service_id: SERVICE_ID,
      template_id: TEMPLATE_ID,
      user_id: PUBLIC_KEY,
      accessToken: PRIVATE_KEY,
      template_params: {
        recipient_email: recipient,
        current_date: currentDate.toDateString(),
        better_date: betterDate.toDateString(),
        order_number: orderNumber,
      },
    }

    axios.post('https://api.emailjs.com/api/v1.0/email/send', data)
  }
}
