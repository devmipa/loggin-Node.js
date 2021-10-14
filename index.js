//this is a complete CRUD operation for loggin user
//you can create user, sign in, authentication, restore-password and delete user.
const express = require('express')
const app = express()
require('./startup/connectMongo')()

//import routers
const routerUser = require('./routers/users')
const routerAuth = require('./routers/auth')

//variables
const port = process.env.PORT || 3000

//middlewares
app.use(express.json())
app.use('/api/users',routerUser)
app.use('/api/auth',routerAuth)


//listen for connection
app.listen(port, ()=> console.log('Listen for connection at port: ',port))

