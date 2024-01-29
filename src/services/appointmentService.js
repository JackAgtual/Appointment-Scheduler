import puppeteer from 'puppeteer'
import { LogsService } from './logsService.js'
import { EmailService } from './emailService.js'
import { CryptoService } from './cryptoService.js'
import { UserService } from './userService.js'

const URL = 'https://sandiegoca.permitium.com/order_tracker'

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

  static async findAppointment({ orderNumber, email, password }) {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    await page.goto(URL)

    // Login
    await page.type('#orderid', orderNumber)
    await page.type('#email', email)
    await page.type('#password', password)
    await page.click('#loginButton')
    await page.waitForNavigation()

    // get current appointment
    const dateStr = await page.$eval('#timeSelected > strong > u', (el) => el.innerText)
    const curAppointmentDate = new Date(dateStr)

    await page.click('#rescheduleButton')
    await page.waitForSelector('#weekDiv > .calday')

    let firstAppointmentDateThisWeek
    let foundBetterAppointment = false
    do {
      const datesThisWeek = await page.$$eval('#weekDiv > .calday', (elements) => {
        return elements.map((el) => el.innerText)
      })
      const appointmentDetails = datesThisWeek[1]
      firstAppointmentDateThisWeek = new Date(appointmentDetails.split('\n')[1])

      const appointmentAvailable = appointmentDetails
        .toLowerCase()
        .includes('select time')

      if (appointmentAvailable) {
        foundBetterAppointment = true
        break
      }

      await page.click('#nextWeekButton > a')
      await page.waitForFunction(
        AppointmentService.dateHasChanged,
        {},
        firstAppointmentDateThisWeek,
      )
    } while (firstAppointmentDateThisWeek.valueOf() < curAppointmentDate.valueOf())

    await browser.close()

    const bestAppointment = foundBetterAppointment ? firstAppointmentDateThisWeek : null

    if (bestAppointment !== null) {
      await EmailService.send({
        recipient: email,
        currentDate: curAppointmentDate,
        betterDate: bestAppointment,
        orderNumber,
      })
    }

    return {
      bestAppointment,
      currentAppointment: curAppointmentDate,
    }
  }

  static async findAppointmentAndLog({ orderNumber, email, password }) {
    const { bestAppointment, currentAppointment } =
      await AppointmentService.findAppointment({ orderNumber, email, password })

    LogsService.create({
      email,
      currentAppointment,
      bestAppointmentFound: bestAppointment,
    })
    return { bestAppointment, currentAppointment }
  }

  static async findAppointmentsAndLogAllUsers() {
    const enrolledUsers = await UserService.getAllEnrolledUsers()
    const credentials = enrolledUsers.map((user) => {
      const { encryptedPassword, iv, email, orderNumber } = user
      const password = CryptoService.decrypt(encryptedPassword, iv)
      return {
        orderNumber,
        email,
        password,
      }
    })

    for (const credential of credentials) {
      await AppointmentService.findAppointmentAndLog(credential)
    }
  }
}
