import mongoose from "mongoose";
import bcrypt from "bcrypt";
import validator from 'validator'

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    validate: {
      message: "Please enter a valid email.",
      validator: (email) => validator.isEmail(email)
    },
  },
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: [true, "Password is required."],
    validate: [
      {
        message: "Password must be at least 8 characters in length.",
        validator: (password) => password.length >= 8
      },
      {
        message: "Password must contain at least 1 lowercase, uppercase, and symbol",
        validator: (password) => validator.isStrongPassword(password, 
          { minLowercase: 1, minUppercase: 1, minSymbols: 1, minNumbers: 1 }
        )
      }
    ]
  },
});

// * Before the user document is created, we want to replace 
// * the password with a hashed version.
// mongoose has a lifecycle for each document, e.g. validation, saving etc.
// this one runs before saving a document to the database.
userSchema.pre('save', function(next) {
  // 'this' refers to the doc you're about to save.
  // this line replaces the password with the hashed password.
  this.password = bcrypt.hashSync(this.password, bcrypt.genSaltSync())
  next() // this tells mongoose we're done.
})

// * I need a function to compare the passwords and return true
// * if the passwords match.
// This will actually a method to all user documents.
userSchema.methods.isPasswordValid = function(plaintextPassword) {
  // Use bcrypt to check the 2 passwords
  // ? Argument 1: password user is trying to log in with
  // ? Argument 2: real existing hashed password for this user
  return bcrypt.compareSync(plaintextPassword, this.password)
}

export default mongoose.model("User", userSchema);

