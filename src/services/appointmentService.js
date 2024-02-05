import puppeteer from 'puppeteer'
import axios from 'axios'
import { LogsService } from './logsService.js'
import { EmailService } from './emailService.js'
import { CryptoService } from './cryptoService.js'
import { UserService } from './userService.js'

const permitiumURL = 'https://sandiegoca.permitium.com/order_tracker'

export class AppointmentService {
  static dateHasChanged(previousFirstAppointmentDate) {
    previousFirstAppointmentDate = new Date(previousFirstAppointmentDate) // needed even though previousFirstAppointmentDate is passed as a Date obj

    const datesAndStatus = Array.from(
      document.querySelectorAll('#weekDiv > .calday'),
    ).map((el) => el.innerText)
    const firstAppointmentDateThisWeek = new Date(datesAndStatus[1].split('\n')[1])

    return (
      previousFirstAppointmentDate.valueOf() !== firstAppointmentDateThisWeek.valueOf()
    )
  }

  static async validateCredentials({ orderNumber, email, password }) {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    await page.goto(permitiumURL)

    // Login
    await page.type('#orderid', orderNumber)
    await page.type('#email', email)
    await page.type('#password', password)
    await page.click('#loginButton')
    await page.waitForNavigation()

    const errorMessageSelector =
      'body > div.container.bg-body.shadow.rounded-bottom.mb-5.p-4 > div.content.gradientBoxesWithOuterShadows > div.row.mt-5 > div.col-md-8 > div'

    const credentialsAreValid = (await page.$(errorMessageSelector)) === null

    const errorMessage = credentialsAreValid
      ? null
      : await page.$eval(errorMessageSelector, (el) => el.innerText)

    await browser.close()
    return { credentialsAreValid, errorMessage }
  }

  static async findAppointments(endDateValue) {
    const appointmentApiBaseUrl = 'https://sandiegoca.permitium.com/ccw/appointments'

    const res = await axios.get(appointmentApiBaseUrl, {
      params: {
        schedule: 'ccw_schedule',
        end: endDateValue,
        permitType: 'ccw_new_permit',
      },
    })

    return res.data

    // if (bestAppointment !== null) {
    //   await EmailService.send({
    //     recipient: email,
    //     currentDate: curAppointmentDate,
    //     betterDate: bestAppointment,
    //     orderNumber,
    //   })
    // }

    // return {
    //   bestAppointment,
    //   currentAppointment: curAppointmentDate,
    // }
  }

  static async findAppointmentAndLog(endDateValue) {
    const appointments = await AppointmentService.findAppointments(endDateValue)

    const bestAppointmentFound = appointments.length === 0 ? null : appointments[0]

    // TODO: only log if you found a better appointment

    LogsService.create({
      email,
      currentAppointment,
      bestAppointmentFound,
    })

    return bestAppointmentFound
  }

  //   static async findAppointmentsAndLogAllUsers() {
  //     const enrolledUsers = await UserService.getAllEnrolledUsers()
  //     const credentials = enrolledUsers.map((user) => {
  //       const { encryptedPassword, iv, email, orderNumber } = user
  //       const password = CryptoService.decrypt(encryptedPassword, iv)
  //       return {
  //         orderNumber,
  //         email,
  //         password,
  //       }
  //     })

  //     for (const credential of credentials) {
  //       await AppointmentService.findAppointmentAndLog(credential)
  //     }
  //   }
}
