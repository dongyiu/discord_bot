const { Schema, model } = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const Apps = new Schema({
    appId : {
        unique : true,
        type : Number,
    },
    appName : {
        type : String,
        required : true
    },
    userId : {
        type : String,
        required : true
    },
    appsInfo : {
        type : [],
        required : true
    },
    applyAt : {
        type : Number,
        default : Date.now()
    },
    status : {
        type : String,
        default : 'pending'
    },
    comments : {
        type : [],
        default : []
    }
});
Apps.plugin(AutoIncrement, { inc_field: 'appId' });
module.exports = model('Apps', Apps);