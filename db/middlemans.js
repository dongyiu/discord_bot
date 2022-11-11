const { Schema, model } = require('mongoose');

const middlemans = new Schema({
    userId : {
        type : String,
        required : true,
        unique : true,
    },
    counter : {
        type : Number,
        default : 0,
    },
});

module.exports = model('middlemans', middlemans);