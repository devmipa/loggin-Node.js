const bcrypt = require('bcrypt')
const express = require('express')
const routerAuth = express()

//modules
const {validateDataAuth} = require('../models/auth')
const {User} = require('../models/user')

routerAuth.post('/',async(req,res)=>{
    //validate data
    const error = validateDataAuth(req.body)
    if(error) return res.status(400).send(error.details[0].message)
    //validate user    
    const userResult = await User.findOne({ email: req.body.email })
    if(!userResult) return res.status(400).send('Invalid Email')
    //validate password
    const passResult = await bcrypt.compare(req.body.password,userResult.password)
    if(!passResult) return res.status(400).send('Invalid password')
    //generate token
    const token = userResult.generateToken()
    //send token to user
    res.send(token)
})

module.exports =routerAuth 