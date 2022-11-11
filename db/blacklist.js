const { Schema, model } = require('mongoose');

const blacklist = new Schema({
    userId : {
        type : String,
        required : true,
    },
    logs : {
        type : [],
        default : []
    },
    guildId : {
        type : String,
        required : true,
    },
});

module.exports = model('blacklist', blacklist);