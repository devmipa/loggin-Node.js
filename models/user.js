const config = require('config')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const Joi = require('joi')  //for validating data
const { func } = require('joi')

//defining the model for users
const userSchema = new mongoose.Schema({
    fullname:{
        type:String,
        minlength:5,
        maxlength:20,
        required:true
    },
    email:{
        type:String,
        maxlength:50,
        required:true
    },
    password:{
        type:String,
        minlength:6,
        maxlength:256,
        required:true
    },
    address:{
        type:String,
        maxlength:50,
        default:""
    },
    phone:{
        type:String,
        minlength:6,
        maxlength:10
    },
    isAdmin:{
        type:Boolean,
        default:false
    }
})

//middleware for generate token
userSchema.methods.generateToken = function(){
    return jwt.sign({_id:this._id,isAdmin:this.isAdmin},config.get('MyPrivateKey'))
}

//middleware for generate token with expired time
userSchema.methods.generateTokenWhitTimeExpired = function(time){
    return jwt.sign({_id:this._id},config.get('MyPrivateKey'))
}

const User = mongoose.model('User',userSchema)

function validateUser(data){
    const schema = Joi.object({
        fullname:Joi.string().min(5).max(20).required(),
        email:Joi.string().email().max(50).required(),
        password:Joi.string().min(6).max(256).required()
    })
    const {error} = schema.validate(data)
    return error
}

function validateEmail(data){
    const emailSchema = Joi.object({
        email:Joi.string().email().required()
    })
    const {error} = emailSchema.validate(data)
    return error
}

function validatePassword(data){
    const passSchema = Joi.object({
        password:Joi.string().required().min(6)
    })
    const {error} = passSchema.validate(data)
    return error
}

function validateDataProfile(data){
    const schema = Joi.object({
        address:Joi.string().max(50).required(),
        phone:Joi.string().min(6).max(10).required()
        //other data for profile user
    })
    const {error} = schema.validate(data)
    return error
}

function validateBoolean(data){
    const schema = Joi.object({
        isAdmin:Joi.boolean().required()        
    })
    const {error} = schema.validate(data)
    return error
}

module.exports.User = User
module.exports.validateUser = validateUser
module.exports.validateEmail = validateEmail
module.exports.validatePassword = validatePassword
module.exports.validateDataProfile = validateDataProfile
module.exports.validateBoolean = validateBoolean