import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import usersRouter from './routes/usersRoute.js'
import logsRouter from './routes/logsRoute.js'
import appointmentsRouter from './routes/appointmentsRoute.js'

dotenv.config()
const app = express()
const PORT = process.env.PORT || 8000
const DATABASE_URL = process.env.DATABASE_URL

mongoose.connect(DATABASE_URL)

const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('Connected to database'))

app.use(express.json())

app.use('/users', usersRouter)
app.use('/logs', logsRouter)
app.use('/appointments', appointmentsRouter)

app.get('/', (req, res) => {
  res.send('Connected to appointment scheduler API')
})

app.listen(PORT, () => {
  console.log(`Running server on http://localhost:${PORT}`)
})
