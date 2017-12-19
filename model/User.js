/**
 * Created by Strauss on 18/12/2017.
 */
const mongoose = require("mongoose");

// ------ User Schema ------
UserSchema = mongoose.Schema({
    userName: String
});
module.exports = mongoose.model('User', UserSchema);