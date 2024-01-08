import { CronJob } from 'cron'
import { findAppointment } from './puppeteer.js'

new CronJob('0 * * * *', findAppointment, null, true)
