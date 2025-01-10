import express from 'express'
// * Import mongoose
import mongoose from 'mongoose'
// * Importing my destinations model
import destinationController from './controllers/destinationController.js'
import logger from './middleware/logger.js'
import errorHandler from './middleware/errorHandler.js'
import methodOverride from 'method-override'

const app = express()

app.use(express.json())

// * This will expect the form data from your form, and add to req.body 
app.use(express.urlencoded({ extended: false }))
app.use(methodOverride('_method'))

// * New logging middleware
app.use(logger)

// * Have our app use the new destination controller
app.use('/', destinationController)

// * Final piece of middleware
app.use(errorHandler)

// This makes it run on port 3000.
app.listen(3000, () => {
  console.log('Server is running on port 3000!')
})

// * Connect to our database using mongoose.
const url = 'mongodb://127.0.0.1:27017/'
const dbname = 'destinations-db'
mongoose.connect(`${url}${dbname}`)
// mongoose.connect('mongodb://127.0.0.1:27017/destinations-db')