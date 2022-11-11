const { Schema, model } = require('mongoose');

const embed = new Schema({
    guildId : {
        type : String,
        required : true,
    },
    name : {
        type : String,
        required : true,
    },
    channel : {
        type : [],
        default : []
    },
    role : {
        type : [],
        default : []
    },
    embed : {
        type : String,
        required : true,
    },
    errMessage :  {
        type : String,
        default : null,
    },
});

module.exports = model('embed', embed);