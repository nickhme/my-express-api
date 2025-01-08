// * This program is responsible for adding (seeding) data to our database
// * for development purposes.
import mongoose from "mongoose"
import Destination from '../models/destination.js'
import destinations from '../data.js' 
// ? We definitely need a mongoose model (destinations, to create our data in the db)
// ? We also need to use mongoose to connect to MongoDB
// ? we need a data.js file to use to seed our data.

async function seed() {
  // This function should seed our database with data from our file.
  console.log('Connecting to database 🌱')
  await mongoose.connect('mongodb://127.0.0.1:27017/destinations-db')
  
  // ! This code wipes the database clean.
  // console.log('Clearing database... 🧹')
  // await mongoose.connection.db.dropDatabase()

  // This seeds new data
  console.log('Seed the new destinations 🌱')
  const newDestinations = await Destination.create(destinations)
  console.log(newDestinations)
  
  // This ends the connection to database
  console.log('Goodbye! 🌱')
  await mongoose.disconnect()
}

seed()