import express from 'express'
// You can import your own files into each other.
import destinations from './data.js'
// * Import mongoose
import mongoose from 'mongoose'
// * Importing my destinations model
import Destination from './models/destination.js'


const app = express()

app.use(express.json())

app.post('/destinations', async function(req, res) {
// Create the document in the database
  const newDestination = await Destination.create(req.body)
  // Send back our destination with appropriate status code.
  res.status(201).send(newDestination)
})


// When the client makes a request to /
app.get('/destinations', async function(req, res) { // call this function
  const allDestinations = await Destination.find()
  res.send(allDestinations)
}) 

// :id -> parameter/variable in the path, called id
app.get('/destinations/:id', async function(req, res) {
  const destinationId = req.params.id

  const destination = await Destination.findById(destinationId)

  res.send(destination)
})

app.get('/destination-by-name/:name', async function(req, res) {
  const destination = await Destination.findOne({ name: { $regex: new RegExp(`^${req.params.name}$`, 'i') } })
  res.send(destination)
})


app.delete('/destinations/:id', async function(req, res) {
  const destinationId = req.params.id

  const destination = await Destination.findById(destinationId)

  if (!destination) {
    return res.send({ message: "Destination doesn't exist." })
  }

  await Destination.findByIdAndDelete(destinationId)

  res.sendStatus(204)
})

app.put('/destinations/:id', async function(req, res) {
  const destinationId = req.params.id

  const updatedDestination = await Destination.findByIdAndUpdate(destinationId, req.body, { new: true })

  res.send(updatedDestination)
})

// This makes it run on port 3000.
app.listen(3000, () => {
  console.log('Server is running on port 3000!')
})

// * Connect to our database using mongoose.
const url = 'mongodb://127.0.0.1:27017/'
const dbname = 'destinations-db'
mongoose.connect(`${url}${dbname}`)
// mongoose.connect('mongodb://127.0.0.1:27017/destinations-db')