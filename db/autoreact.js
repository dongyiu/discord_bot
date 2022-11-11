const { Schema, model } = require('mongoose');

const autoreact = new Schema({
    userId : {
        type : String,
        required : true,
        unique : true
    },
    autoreact : {
        type : [],
        default : [],
    },
});

module.exports = model('autoreact', autoreact);