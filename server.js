import express from 'express'
// You can import your own files into each other.
import destinations from './data.js'

const app = express()

app.use(express.json())

// When the client makes a request to /
app.get('/destinations', function(req, res) { // call this function
  res.send(destinations)
})

// :name -> parameter/variable in the path, called name
app.get('/destinations/:name', function(req, res) {
  console.log(req.params.name) // this gets the VALUE of that variable for this request.
  
  const destinationName = req.params.name

  const destination = destinations.find((currentDestination) => {
    return currentDestination.name.toLowerCase() === destinationName.toLowerCase()
  })

  res.send(destination)
})

app.post('/destinations', function(req, res) {
  // Get the new destination from the body of request
  const newDestination = req.body
  // Add destination to existing destinations
  destinations.push(newDestination)
  // Send back our destination with appropriate status code.
  res.status(201).send(newDestination)
})

app.put('/destinations/:id', function(req, res) {
  const destinationId = Number(req.params.id) // making sure its a number
  const updatedDestination = req.body
  // * Replacing the whole object in your PUT
  // 1) Get the destination index to replace
  const destinationIndex = destinations.findIndex((destination) => {
    return destination.id === destinationId
  })
  // 2) Overwrite that object in the array
  destinations[destinationIndex] = updatedDestination
  // 3) Send it back to the user
  res.send(updatedDestination)
})



// This makes it run on port 3000.
app.listen(3000, () => {
  console.log('Server is running on port 3000!')
})