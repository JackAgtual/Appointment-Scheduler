import puppeteer from 'puppeteer'
import dotenv from 'dotenv'
import { sendEmail } from './services/emailjs/emailjs.js'
dotenv.config()

const URL = 'https://sandiegoca.permitium.com/order_tracker'
const orderNumber = process.env.ORDER_NUMBER
const email = process.env.EMAIL
const password = process.env.PASSWORD

function dateHasChanged(previousFirstAppointmentDate) {
  previousFirstAppointmentDate = new Date(previousFirstAppointmentDate) // needed even though previousFirstAppointmentDate is passed as a Date obj

  const datesAndStatus = Array.from(document.querySelectorAll('#weekDiv > .calday')).map(
    (el) => el.innerText,
  )
  const firstAppointmentDateThisWeek = new Date(datesAndStatus[1].split('\n')[1])

  return previousFirstAppointmentDate.valueOf() !== firstAppointmentDateThisWeek.valueOf()
}

export async function findAppointment() {
  console.log(`Checking appointments. Current time: ${new Date()}`)

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

    const appointmentAvailable = appointmentDetails.toLowerCase().includes('select time')

    if (appointmentAvailable) {
      foundBetterAppointment = true
      break
    }

    await page.click('#nextWeekButton > a')
    await page.waitForFunction(dateHasChanged, {}, firstAppointmentDateThisWeek)
  } while (firstAppointmentDateThisWeek.valueOf() < curAppointmentDate.valueOf())

  if (!foundBetterAppointment) await browser.close()

  sendEmail(
    email,
    curAppointmentDate.toDateString(),
    firstAppointmentDateThisWeek.toDateString(),
  )

  await browser.close()
}
