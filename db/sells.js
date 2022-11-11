const { Schema, model } = require('mongoose');

const Sells = new Schema({
    userId : {
        type : String,
        required : true,
        unique : true,
    },
    shops : {
        type : [],
        default : [],
    },
    lastPosted : {
        type : Number,
        default : 0,
    },
    auto : {
        status : {
            type : Boolean,
            default : false,
        },
        lastRan : {
            type : Number,
            default : Date.now(),
        }
    },
});

module.exports = model('Sells', Sells);