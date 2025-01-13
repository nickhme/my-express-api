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
    res.redirect('/')
  } catch (e) {
    next(e)
  }  
});

export default router