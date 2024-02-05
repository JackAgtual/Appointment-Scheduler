import puppeteer from 'puppeteer'
import axios from 'axios'
import { LogsService } from './logsService.js'
import { EmailService } from './emailService.js'
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

  static async getCurrentAppointmentDate({ orderNumber, email, password }) {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    await page.goto(permitiumURL)

    // Login
    await page.type('#orderid', orderNumber)
    await page.type('#email', email)
    await page.type('#password', password)
    await page.click('#loginButton')
    await page.waitForNavigation()

    const dateStr = await page.$eval('#timeSelected > strong > u', (el) => el.innerText)
    return new Date(dateStr)
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

  static async findAppointmentsForAllUsers() {
    const { appointmentDate: latestAppointmentDate } =
      await UserService.getLatestAppointmentOfEnrolledUsers()

    const appointments = await AppointmentService.findAppointments(
      latestAppointmentDate.valueOf(),
    )

    const enrolledUsers = await UserService.getAllEnrolledUsers()
    // TODO: Update enrolled users query time here

    if (appointments.length === 0) return

    const bestAppointmentValue = appointments.shift()

    for (const user of enrolledUsers) {
      const { email, appointmentDate, orderNumber } = user

      const userCurAppointment = appointmentDate.valueOf()
      const betterAppointmentAvailable = bestAppointmentValue < userCurAppointment
      if (!betterAppointmentAvailable) continue

      const bestAppointmentDate = new Date(bestAppointmentValue)

      LogsService.create({
        email,
        currentAppointment: appointmentDate,
        bestAppointmentFound: bestAppointmentDate,
      })

      EmailService.send({
        recipient: email,
        currentDate: appointmentDate,
        betterDate: bestAppointmentDate,
        orderNumber,
      })
    }
  }
}
