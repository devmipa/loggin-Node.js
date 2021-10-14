const Joi = require('joi')
const config = require('config')
const jwt = require('jsonwebtoken')
const { func } = require('joi')
function validateToken(req,res,next){
    try{
        req.user = jwt.verify(req.header('x-auth-token'),config.get('MyPrivateKey'))
        next()
    } catch(ex){
        return res.status(400).send(ex.message)
    }
    
}
function validateTokeninUrl(token){
    try{
        const payload = jwt.verify(token,config.get('MyPrivateKey'))
        return payload._id
    } catch(ex){
        return res.status(400).send(ex.message)
    }    
}

//middleware for verify if the user isAdmin
function isAdmin(req,res,next){
    if(!req.user.isAdmin) return res.status(403).send('Unauthorizated because you are not admin')
    //if the user is admin, then continue
    next()
}

function validateDataAuth(data){
    const schema =Joi.object({
        email:Joi.string().email().required(),
        password:Joi.string().max(256).required()
    })
    
    const {error} = schema.validate(data)
    return error
}

module.exports.validateToken = validateToken
module.exports.validateTokeninUrl = validateTokeninUrl
module.exports.isAdmin = isAdmin
module.exports.validateDataAuth = validateDataAuth