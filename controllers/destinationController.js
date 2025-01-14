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

    console.log(req.session.user)

    if (!req.session.user) {
      return res.status(402).send({ message: "You must be logged in to post a destination." })
    }

    console.log(req.body)
    if (!req.body.attractions) req.body.attractions = ""
    req.body.attractions = req.body.attractions.split(',')
    console.log(req.body)
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
    const allDestinations = await Destination.find()
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

  const destination = await Destination.findById(destinationId)

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
  const destinationId = req.params.id

  const updatedDestination = await Destination.findByIdAndUpdate(destinationId, req.body, { new: true })

  res.redirect('/destinations')
})


export default router