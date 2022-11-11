const { Schema, model } = require('mongoose');

const Grinds = new Schema({
    userId : {
        type : String,
        required : true,
        unique : true,
    },
    manager : {
        status : {
            type : Boolean,
            default : false
        },
        user : {
            type : String,
            default : null
        },
        sent : {
            type : Number,
            default : 0
        },
        demoted : {
            type : Boolean,
            default : false
        }
    },
    donation : {
        type: Number,
        default : 0
    },
    nextdono : {
        type : Number,
        default : Date.now() 
    },
    av : {
        type : String,
        default : null
    },
    userName : {
        type : String,
        default : null
    },
    icon : {
        type : String,
        default : null
    }
});

module.exports = model('Grinds', Grinds);