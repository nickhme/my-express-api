// * This file allows to me create a model for a particular collection.
// * This is so all destinations (for example) are always consistent (have the same fields).

import mongoose from "mongoose";

// ? Creating an embedded schema
const commentSchema = new mongoose.Schema({
  content: { type: String, required: [true, "You can't post an empty comment."] },
  // this is the user who posted the comment
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true
})

// create a schema (consistent format) for my destination collection
const destinationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  country: { type: String, required: true },
  description: { type: String, required: false },
  attractions: [{ type: String }],
  // * Adding a relationship between destinations and users
  // ? This is called a reference relationship.
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // ? This is an embedded schema, an array of comments
  comments: [commentSchema]
})

// export the schema as a model
// ! The first argument to the model method MUST be a string pascalcase (uppercase words), singular 
export default mongoose.model('Destination', destinationSchema)