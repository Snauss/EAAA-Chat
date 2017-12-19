/**
 * Created by Strauss on 18/12/2017.
 */

const mongoose = require("mongoose");

// ------ Chat Schema ------
ChatMsgSchema = mongoose.Schema({
    author: {type: mongoose.Schema.Types.ObjectId,ref:"User"},
    timeStamp: Date,
    messageBody: String,
    room : {type: mongoose.Schema.Types.ObjectId,ref:"ChatRoom"}
});
module.exports = mongoose.model('ChatMsg', ChatMsgSchema);
