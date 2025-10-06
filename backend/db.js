const mongoose = require('mongoose');

const signupschema = new mongoose.Schema({
    username: String,
    email: {type: String, unique: true},
    password: String,
});

const dataschema =new mongoose.Schema({
    state:String,
    district:String,
    N:Number,
    P:Number,
    K:Number,
    ph:Number
},{ collection: 'data' })

const Data = mongoose.model("Data" ,dataschema)
const User = mongoose.model('User', signupschema);

module.exports = {
    User,
    Data
}
