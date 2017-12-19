var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
// var schema = require('../model/schema');
var database = require('../model/database');

var room = require('../model/ChatRoom.js');
var chatMsg = require('../model/ChatMessage.js');
var user = require('../model/User.js');

var app = express();
app.use(bodyParser.json());
app.listen(3001);

// ---- To allow requests from outside ----
app.use(function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader("Access-Control-AlerrorHandlerlow-Credentials", true);
    next();
});

app.all("*", function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With"
    );
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST");
    return next();
});

app.all("*", function (req, res, next) {
    if (req.method.toLowerCase() !== "options") {
        return next();
    }
    return res.send(204);
});
// -------------------------------------------


/* GET all chat messages */
app.get('/message/get', function(req, res, next) {
    var ObjectId = require('mongoose').Types.ObjectId;

    console.log("da req body ", req.query);
    chatMsg.find({room: new ObjectId(req.query.id)}).populate("room").populate("author").exec(function (err, chats) {
        // console.log("the chats: ",chats);
        if (err)
            return console.error(err);
        // console.log("Load success: ", chats);
        res.send(chats);

    });
});

app.get('/room/get',function (req,res,next) {
    room.find({}).exec(function (err,rooms) {
        if (err)
            return console.error(err);
        res.send(rooms);
    })
});


/* POST single chat post */
app.post('/message/create', function(req, res, next) {
    req.body.timeStamp = new Date();
    var instance = new chatMsg(req.body);
    // console.log(instance);

    instance.save(function (err, ChatMsg) {
        result = err?err:ChatMsg;
        res.send(result);
        console.log("chat backend ", result);
        router.notifyclients();
        return result;
    });
});

app.post('/user/create', function (req,res,next) {
    console.log("userbody ",req.body);
    var instance = new user(req.body);
    instance.save(function (err, user) {
        result = err?err:user;
        console.log("user result ", result);
        res.send(result);
        router.notifyclients();
        return result;
    });
});

app.post('/room/create', function (req,res,next) {
    // console.log("userbody ",req.body);
    req.body.lastUpdated = new Date();
    var instance = new room(req.body);
    instance.save(function (err, room) {
        result = err?err:room;
        res.send(result);
        router.notifyclients();
        return result;
    });
});


/* Notify chat messages to connected clients */
router.clients = [];
router.addClient = function (client) {
    router.clients.push(client);
    router.notifyclients(client);
};
router.notifyclients = function (client) {
   chatMsg.find({}).exec(function (err, chats) {
        if (err)
            return console.error(err);
        //console.log("Load success: ", chats);
        var toNotify = client?new Array(client):router.clients;
        toNotify.forEach(function(socket){
            socket.emit('refresh', chats);
        })
    });
};



//export the router
module.exports = router;