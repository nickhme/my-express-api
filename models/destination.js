// * This file allows to me create a model for a particular collection.
// * This is so all destinations (for example) are always consistent (have the same fields).

import mongoose from "mongoose";

// create a schema (consistent format) for my destination collection
const destinationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  country: { type: String, required: true },
  description: { type: String, required: false },
  attractions: [{ type: String }],
  imageUrl: { type: String },
  // * Adding a relationship between destinations and users
  // ? This is called a reference relationship.
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
})

// export the schema as a model
// ! The first argument to the model method MUST be a string pascalcase (uppercase words), singular 
export default mongoose.model('Destination', destinationSchema)