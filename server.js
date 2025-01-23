import express from 'express'
// * Import mongoose
import mongoose from 'mongoose'
// * Importing my destinations model
import destinationController from './controllers/destinationController.js'
import userController from './controllers/userController.js'
import logger from './middleware/logger.js'
import errorHandler from './middleware/errorHandler.js'
import methodOverride from 'method-override'
import session from 'express-session'
import mongoSanitize from 'express-mongo-sanitize'

import path from "path"; // ! You need this line for stylesheets/JS
import { fileURLToPath } from "url"; // ! You need this line for stylesheets/JS

// Get __dirname equivalent
const __filename = fileURLToPath(import.meta.url); // ! You need this line for stylesheets/JS
const __dirname = path.dirname(__filename); // ! You need this line for stylesheets/JS

// import dotenv to extract environment variables from the .env file
import dotenv from 'dotenv'
dotenv.config() // initalises .env

const app = express()

// Serve static files
app.use(express.static(path.join(__dirname, "public"))); // ! You need this line for stylesheets/JS

// * Add sessions to express
app.use(session({
  // secret: 'correcthorsebatterystaplefruitcake', // without .env
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false, // is this using HTTPS?
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24, // expire tomorrow
  }
}))

app.use(express.json())

// * Strip out special chars like $, . from keys
app.use(mongoSanitize());

// * This will expect the form data from your form, and add to req.body 
app.use(express.urlencoded({ extended: false }))
app.use(methodOverride('_method'))

// * New logging middleware
app.use(logger)

// * Have our app use the new destination controller
app.use('/', destinationController)
app.use('/', userController)

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