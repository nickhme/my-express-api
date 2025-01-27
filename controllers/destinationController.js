// * This file is where all our logic lives for destinations.
// * All the endpoints/routes live in here.

// TODO use a router to refactor our routes in here.
import express from 'express'
import Destination from '../models/destination.js'

const router = express.Router()

router.route('/').get(async function(req, res, next) {
  try {
    res.render('home.ejs')
  } catch(e) {
    next(e)
  }
})

router.route('/destinations').post(async function (req, res, next) {
  try {

    if (!req.session.user) {
      return res.status(402).send({ message: "You must be logged in to post a destination." })
    }

    if (!req.body.attractions) req.body.attractions = ""
    req.body.attractions = req.body.attractions.split(',')

    // ! Add the user to the req.body, from the cookie
    req.body.user = req.session.user

    // Create the document in the database
    const newDestination = await Destination.create(req.body)
    // Send back our destination with appropriate status code.
    res.redirect('/destinations')
  } catch (e) {
    next(e)
  }
})

router.route('/destinations').get(async function (req, res) { // call this function
  try {
    // * populate the user field
    const allDestinations = await Destination.find().populate('user')
    console.log(allDestinations)

    // ? Passes through allDestinations to the template I am rendering.
    res.render('destinations/index.ejs', {
      allDestinations: allDestinations
    })
  } catch (e) {
    next(e)
  }
})

router.route('/destinations/new').get(async function(req, res, next) {
  try {
    res.render('destinations/new.ejs')
  } catch (e) {
    next(e)
  }
})

router.route('/destinations/:id').get(async function (req, res, next) {
  try {
    const destinationId = req.params.id
    const destination = await Destination.findById(destinationId)
    res.render('destinations/show.ejs', {
      destination: destination
    })
  } catch (e) {
    next(e)
  }
})

router.route('/destination-by-name/:name').get(async function (req, res, next) {
  try {
    const destination = await Destination.findOne({ name: { $regex: new RegExp(`^${req.params.name}$`, 'i') } })
    res.send(destination)
  } catch (e) {
    next(e)
  }
})

router.route('/destinations/:id').delete(async function (req, res) {
  const destinationId = req.params.id

  const destination = await Destination.findById(destinationId).populate('user')

  // * Compare the user who is current logged in (req.session.user)
  // * with the user ON the destination (destination.user)
  console.log(req.session.user._id)
  console.log(destination.user._id)
  
  if (!destination.user._id.equals(req.session.user._id)) {
    return res.status(402).send({ message: "This is not your destination to delete!"})
  }

  if (!destination) {
    return res.send({ message: "Destination doesn't exist." })
  }

  await Destination.findByIdAndDelete(destinationId)

  res.redirect('/destinations')
})

router.route('/destinations/update/:id').get(async function(req, res, next) {
  try {
    const destination = await Destination.findById(req.params.id).exec()
    res.render('destinations/update.ejs', {
      destination: destination
    })
  } catch(e) {
    next(e)
  }
})

router.route('/destinations/:id').put(async function (req, res) {
  // are they logged in? if not, send them away
  // get the destination they're trying to update
  // check if they're authorized to do that
  // if they are, let them make the update.
  
  const destinationId = req.params.id

  const updatedDestination = await Destination.findByIdAndUpdate(destinationId, req.body, { new: true })

  res.redirect('/destinations')
})


export default router