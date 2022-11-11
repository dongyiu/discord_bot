const { Schema, model } = require('mongoose');

const auc = new Schema({
    userId : {
        type : String,
        required : true,
        unique : true,
    },
    time : {
        type : String,
        default : null,
    },
});

module.exports = model('auc', auc);