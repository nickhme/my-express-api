import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
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

