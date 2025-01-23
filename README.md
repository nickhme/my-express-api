# Netlify Deployment Backend

### Read this first for context:

We'll be using Netlify's support for **serverless** functions to deploy our backend. 

Serverless functions are pieces of code that can be run by some service (Netlify), as and when needed.

With serverless, when a user makes a request to our website, netlify will _call a function_ to handle the request. This function will create an express application, handle the request with the correct route, and then stop the express application as soon as the request is complete. 

This is in stark contrast to running an express server ourselves that listens indefinitely on a port.

The general advantage of serverless functions are that they are cheaper, you don't need a server to be continuously running waiting for requests, you create everything just-in-time when it's needed.

So cheap in fact, that Netlify offer this service free! We don't need to pay anything for hosting 😎.

To take advantage of Netlify serverless, we'll need to create a couple of files for netlify to use.. and do a little setup..

## 1. Add a netlify.toml file to the project root

Make sure the file is named `netlify.toml` and is placed in the **root** of your project. Copy in the below code to this file:

```
[functions]
  external_node_modules = ["express", "ejs"]
  node_bundler = "esbuild"
  included_files = ["views/**", "public/**"]

[[redirects]]
  force = true
  from = "/*"
  status = 200
  to = "/.netlify/functions/api/:splat"
```

`toml` files are configuration files, and Netlify will look for one in your project when you deploy it. 

It'll control how Netlify behaves, what files it includes when deploying your project, how to handle URLs, etc.


All of this will ensure that when netlify recieves requests to  your project, it'll use the serverless function we're about to set up, rather than run your express API in the normal way.

## 2. Setup `netlify/functions/api.js` with serverless 

- Create a `netlify` folder in the root of your project.
- Create a `functions` folder inside of the `netlify` folder. 
- Inside the `functions` folder, create your `api.js` file.

The contents of this file will _differ slightly_ depending on your projects structure and the contents of your `server.js` file, so read thorugh carefully here. 

**Please start by copying the contents of your own `server.js` directly file into `api.js`** 

Your file should be similar to mine, but with any additional features/functions you might have added to your API.

Here's what I'm starting with below **as an example** for my `api.js` file:

```js
import express from 'express'
import mongoose from 'mongoose'
import methodOverride from 'method-override'
import session from 'express-session'
import MongoStore from 'connect-mongo'

import destinationController from './controllers/destinationController.js'
import userController from './controllers/userController.js'
import errorHandler from './middleware/errorHandler.js'

import dotenv from 'dotenv'
dotenv.config()

mongoose.connect('mongodb://127.0.0.1:27017/destinations-db')

const app = express()

app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24,
  },
  store: MongoStore.create({
    mongoUrl: 'mongodb://127.0.0.1:27017/destinations-db',
    collectionName: 'sessions',
  }),
}))

app.use(express.json())

app.use(express.static(path.join(__dirname, "public")));

app.use(express.urlencoded({ extended: false }))
app.use(methodOverride('_method'))

app.use('/', destinationController)
app.use('/', userController)

app.use(errorHandler)

app.listen(3000, () => {
  console.log('Server is running on port 3000!')
})
```

We're now going to update this `api.js` file to work with Netlify serverless.

Please go through carefully and make updates to your own `api.js` based on mine. 

Changes are highlighted with 🚨. Explanations for the changes are at the end.

Here's what mine looks like now:

```js
import express from 'express'
import mongoose from 'mongoose'
import methodOverride from 'method-override'
import session from 'express-session'

// 🚨 If you're not already using MongoStore, please `npm i connect-mongo`
import MongoStore from 'connect-mongo'

// 🚨 New dependency, `npm i serverless-http` and use it here:
import serverless from 'serverless-http'

// 🚨 These top imports for YOUR OWN code imports e.g. controllers/middleware 
// MUST now start with ../..
import destinationController from '../../controllers/destinationController.js'
import userController from '../../controllers/userController.js'
import errorHandler from '../../middleware/errorHandler.js'

// 🚨 Make sure you're using dotenv if you're not already. 
// This setup also requires a .env file in your project root.
import dotenv from 'dotenv'
dotenv.config()

// 🚨 Grab the Mongo URL variable from your .env file:
mongoose.connect(process.env.MONGODB_URI)

const app = express()

app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24,
  },
  // 🚨 Make sure you have this below segment to store sessions in MongoDB
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: 'sessions',
}),
}))

app.use(express.json())

// 🚨 The below line has been updated from:
// app.use(express.static(path.join(__dirname, "public")));
// Please use the below now:
app.use(express.static("public"));

app.use(express.urlencoded({ extended: false }))
app.use(methodOverride('_method'))

app.use('/', destinationController)
app.use('/', userController)

app.use(errorHandler)

// 🚨 Remove entire app.listen piece at the bottom, and do this instead:
export const handler = serverless(app)

```

Nice! That's step one. Let's talk about what we've just added.

**Explanation:**

#### Serverless HTTP

The `serverless-http` package wraps our whole express application inside a function that can be called when we need it. Netlify will call this function whenever it runs our `api.js` file.

This is also why we can now remove the code to have our express server `.listen` on a port. It's no longer necessary, because it'll run as a serverless function instead.

#### Updated code imports

Netlify needs the `api.js` file to live inside the special folder `netlify/functions`. 

However, `api.js` still needs to get our existing models, controllers etc, and so it has to go up several directories now to reach them. Hence the `../../` update.

#### `mongoose.connect(process.env.MONGODB_URI)`

This assumes there's a `.env` file in your project root, with a key `MONGODB_URI=`, and a value after the `=` that you got from **Mongo Atlas**. It doesn't have to be called `MONGODB_URI`, but it does have to be consistent with all  other steps in this guide.x

When we actually deploy to **netlify**, we will also need to tell the netlify service about these environment variables. We'll see how to do this in the next section.  


#### `app.use(express.static(path.join(__dirname, "public"))); -> app.use(express.static("public"));`

This is because pathing on netlify works differently. Adding `__dirname` to the front of the path will actually point to the wrong file location. 

Honestly this one was a lot of trial and error to fix. 

#### `connect-mongo` and `MongoStore`

This will persist your user sessions to the database. Serverless functions don't work like servers: they run like functions and nothing is running when they aren't used. This means login isn't going to work properly if sessions aren't saved to the database between function calls.

---

Now we've done all that, it's time to add, commit, and push our changes, so that we can deploy our code to netlify!

## Deployment

Netlify has an excellent GUI to deploy your project for you.

If you don't have a free account yet, create one. If you already used Netlify, you can log in to view your netlify dashboard.

Click the dropdown to **add new site** -> **import existing project**. From there you can follow the steps to deploy with github.

**Important note here**: Make sure on the 3rd step, where you can name your project, you scroll to the bottom and **add environment variables**. You'll need to add a new variable, with `MONGODB_URI` as the key, and the value as your connection string from your `.env` file. Do the same for any other appropriate environment variables you need Netlify to know about, for example your `SECRET_KEY`.

All the other options you can keep the same. If you forget to add the environment variable at this step, you can add it later using the dashboard, and **manually redeploy** your project to fix. There is an option to do this on the dropdown on the deployment page for your project.

## Conclusion

That's it! You've configured your app to take advantage of Netlify's serverless functions.

_For a more in depth explanation of serverless and it's benefits, [here is a netlify article on the subject](https://daily.dev/blog/serverless-functions-netlify-a-beginners-guide)._ 

Once you've deployed your project using the Netlify dashboard, check everything works and be sure to test all your endpoints! 🚀