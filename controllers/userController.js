import express from 'express'
import User from '../models/user.js'

const router = express.Router()

router.get("/signup", (req, res, next) => {
  try {
    res.render("user/signup.ejs");
  } catch (e) {
    next(e)
  }  
});

router.post('/signup', async (req, res, next) => {
  try {
    const user = await User.create(req.body)
    res.redirect('/login')
  } catch (e) {
    next(e)
  }  
});

// TODO login
// Login page (just like signup.ejs) ✅
// GET /login controller to return our ejs page ✅
// When you sign up, redirect to login ✅
router.get('/login', (req, res, next) => {
  try {
    res.render("user/login.ejs");
  } catch (e) {
    next(e)
  }  
})

// POST /login controller to handle POSTing the login.
router.post('/login', async (req, res, next) => {
  try {
    // ? We need to know if the login was actually successful!
    // 1) Get the user for this login attempt (with email)
    const user = await User.findOne({ email: req.body.email })
    // 2) Compare the 2 password hashes to see if they're the same.
    // ! This will check if the login is a failure, and respond accordingly.
    if (!user.isPasswordValid(req.body.password)) {
      return res.status(401).send({ message: "Unauthorized"})
    }

    // If we succeed, we do this later:
    // req.session.user = user
    res.send({ message: "Login successful!"})

  } catch(e) {
    next(e)
  }
})

export default router