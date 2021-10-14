const sendMail = require('../otherFunctions/sendEmail')
const {validateToken,validateTokeninUrl,isAdmin} = require('../models/auth')
const bcrypt = require('bcrypt')
const express = require('express')
const routerUser = express()

//importing models
const {User,validateUser,validateEmail,validatePassword,validateDataProfile,validateBoolean} = require('../models/user')

//endpoint to obtain the user data
routerUser.get('/me',validateToken,async(req,res)=>{
    const infoUser = await User.findById({_id:req.user._id}).select({_id:0,password:0})
    res.send(infoUser)
})

//enpoint to register a new user
routerUser.post('/',async(req,res)=>{
    //validate data
    const error = validateUser(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    //validate if the user exist by their email
    let user = await User.findOne({email:req.body.email})
    if(user) return res.status(400).send('The user for the email already exist!')

    //register in database
    const salt = await bcrypt.genSalt(10) //to generate a encripted password
    const passHashed = await bcrypt.hash(req.body.password,salt)
    user = new User({
        fullname:req.body.fullname,
        email:req.body.email,
        password:passHashed
    })
    //send the info to the user
    const result = await user.save()
    res.send(result.generateToken())
})

//endpoint to delete a user ONLY THE ADMIN HAS ACCES TO THIS ENDPOINT
routerUser.delete('/:id',[validateToken,isAdmin],async(req,res)=>{
    //validate if the id exist
    const existUser = await User.findOne({_id:req.params.id})
    if(!existUser) return res.status(400).send('The user with the guiving id doent exist')
    //delete user
    const resultDelete = await User.deleteOne({_id:req.params.id})
    if(resultDelete.n!=1) return res.status(400).send('The user cant be deleted')
    //respond to user with a succesfull message
    res.send('The user was deleted succesfully')
})


//forgot my password
routerUser.post('/forgot-password',async(req,res)=>{
    //validate email
    const error = validateEmail(req.body)
    if (error) return res.status(400).send(error.details[0].message)
    //verify if the user exist
    const userReturn = await User.findOne({email:req.body.email})
    if(!userReturn) return res.status(400).send('The user with that email doent exist')
    //generate a token whit exiration time
    const token = userReturn.generateTokenWhitTimeExpired('1h')
    //send the email
    //send an email with this token in the url instead.(Shape the url with token like this http://localhost:3000/api/users/reset-password/token)
    const resultMail = await sendMail('admin@gmail.com',userReturn.email,'RESET YOU PASSWORD REQUEST','Hello, The url for reseting your password is: http://localhost:3000/api/users/reset-password/'+token)
    res.send(resultMail)
    
})

//reset password
routerUser.post('/reset-password/:token',async(req,res)=>{
    try{
        const token = req.params.token
        if(!token) return res.status(400).send('invalid token')
        //validate token
        const id = validateTokeninUrl(token)
        //validate password
        const error = validatePassword(req.body)
        if(error) return res.status(400).send(error.details[0].message)
        //hash password
        const salt = await bcrypt.genSalt(10)
        const passHash = await bcrypt.hash(req.body.password,salt)
        //update password
        const userUpdated = await User.findByIdAndUpdate(id,{password:passHash},{new:true})
        res.send('The pass for user:'+userUpdated.email+' was updated successfully')
    } catch(ex){
        res.status(400).send(ex.message)
    }
})

//UPDATE PROFILE
routerUser.put('/updateProfile',validateToken,async(req,res)=>{
    //validate token with an middleware
    //validate data
    const error = validateDataProfile(req.body)
    if(error) return res.status(400).send(error.details[0].message)
    //findAndUpdate user in Mongo Db
    const updatedUser = await User.findByIdAndUpdate(req.user._id,{address:req.body.address,phone:req.body.phone},{new:true}).select({_id:0,password:0})
    //send data to the user
    res.send(updatedUser)
})

//update user permission ONLY FOR USERS THAT ARE ADMIN
routerUser.put('/update-permission/:id',[validateToken,isAdmin],async(req,res)=>{
    //Verify token and if is ADMIN
    //validate data
    const error = validateBoolean(req.body)
    if(error) return res.status(400).send(error.details[0].message)
    //update user permission
    const updatedUser = await User.findByIdAndUpdate(req.params.id,{isAdmin:req.body.isAdmin},{new:true}).select({password:0})
    //send result to user
    res.send(updatedUser)
})

module.exports = routerUser