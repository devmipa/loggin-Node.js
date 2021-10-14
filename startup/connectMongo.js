
const mongoose = require('mongoose')

function connectMongo(){
    //connection string with database
    mongoose.connect('mongodb://localhost:27017/PruebaForLoguinDb')
        .then(()=> console.log('The connection with MONGO DB was succesfully'))
        .catch((ex)=> console.log('Error connecting to the database',ex.message))
}

module.exports = connectMongo