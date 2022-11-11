const { Schema, model } = require('mongoose');

const users = new Schema({
    userId : {
        type : String,
        required : true,
        unique : true,
    },
    coins : {
        type : Number,
        default : 0,
    },
    bank : {
        type : Number,
        default : 0,
    },
    usage : {},
    inventory : {
        type : [],
        default : [],
    },
});

module.exports = model('users', users);