import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import userRouter from './routes/user.js'
import logsRouter from './routes/logs.js'

dotenv.config()
const app = express()
const PORT = process.env.PORT || 8000
const DATABASE_URL = process.env.DATABASE_URL

mongoose.connect(DATABASE_URL)

const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('Connected to database'))

app.use(express.json())

app.use('/user', userRouter)
app.use('/logs', logsRouter)

app.get('/', (req, res) => {
  res.send('Connected to appointment scheduler API')
})

app.listen(PORT, () => {
  console.log(`Running server on http://localhost:${PORT}`)
})
