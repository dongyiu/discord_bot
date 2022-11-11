const { Schema, model } = require('mongoose');

const category = new Schema({
    userId : {
        type : String,
        required : true,
        unique : true,
    },
    category : {
        type : String,
        default : null,
    },
});

module.exports = model('category', category);