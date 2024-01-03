import puppeteer from 'puppeteer'
import dotenv from 'dotenv'
dotenv.config()

const URL = 'https://sandiegoca.permitium.com/order_tracker'
const orderNumber = process.env.ORDER_NUMBER
const email = process.env.EMAIL
const password = process.env.PASSWORD

;(async () => {
  const browser = await puppeteer.launch({ headless: false })
  const page = await browser.newPage()

  await page.goto(URL)

  // Login
  await page.type('#orderid', orderNumber)
  await page.type('#email', email)
  await page.type('#password', password)
  await page.click('#loginButton')
  await page.waitForNavigation()

  //   await browser.close()
})()
