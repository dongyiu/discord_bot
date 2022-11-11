const { Schema, model } = require('mongoose');

const breaks = new Schema({
    userId : {
        type : String,
        required : true,
        unique : true,
    },
    duration : {
        type : Number,
    },
    reason : {
        type : String,
        default : 'N/A'
    },
    timestamp : {
        type : Number,
        default : Date.now(),
    },
    roles : {
        type : [],
        default : []
    }
});

module.exports = model('breaks', breaks);
