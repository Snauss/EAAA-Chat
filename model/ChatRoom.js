/**
 * Created by Strauss on 18/12/2017.
 */

const mongoose = require('mongoose');

// ------ Chat room Schema -----
ChatRoomSchema = mongoose.Schema({
    name:String,
    description: String,
    lastUpdated: Date
});
module.exports = mongoose.model ('ChatRoom',ChatRoomSchema);