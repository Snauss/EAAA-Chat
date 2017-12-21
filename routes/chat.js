let express = require('express');
// var router = express.Router();
let bodyParser = require('body-parser');
let mongoose = require('mongoose');
// var schema = require('../model/schema');
let database = require('../model/database');

let room = require('../model/ChatRoom.js');
let chatMsg = require('../model/ChatMessage.js');
let user = require('../model/User.js');

let app = express();
app.use(bodyParser.json());
app.listen(3001);

let http = require('http').Server(app);
let io = require('socket.io')(http);
http.listen(3002);

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
    return res.sendStatus(204);
});
// -------------------------------------------


/* GET all chat messages */
app.get('/message/get', function (req, res, next) {
    let ObjectId = require('mongoose').Types.ObjectId;

    console.log("da req body ", req.query);
    chatMsg.find({room: new ObjectId(req.query.id)}).populate("room").populate("author").exec(function (err, chats) {
        // console.log("the chats: ",chats);
        if (err)
            return console.error(err);
        // console.log("Load success: ", chats);
        res.send(chats);
    });
});

app.get('/room/get', function (req, res, next) {
    room.find({}).exec(function (err, rooms) {
        if (err)
            return console.error(err);
        res.send(rooms);
    })
});


/* POST single chat post */
app.post('/message/create', function (req, res, next) {
    req.body.timeStamp = new Date();
    let instance = new chatMsg(req.body);
    // console.log(instance);
    instance.save(function (err, ChatMessage) {
        chatMsg.populate(ChatMessage, {path: "author"}, (error, theChatMsg) => {
            chatMsg.populate(theChatMsg, {path: "room"}, (error, ChatMsg) => {
                io.emit("newMessage", ChatMsg);
            });
        });
        result = err ? err : ChatMessage;
        res.send(result);
        // console.log("chat backend ", result);
        // router.notifyclients();
        return result;
    });
});

app.post('/user/create', function (req, res, next) {
    user.findOne(req.body, (error, userFound) => {
        if (userFound) {
            res.send(userFound);
        } else {
            console.log("userbody ", req.body);
            let instance = new user(req.body);
            instance.save(function (err, user) {
                result = err ? err : user;
                console.log("user result ", result);
                res.send(result);
                // router.notifyclients();
                return result;
            });
        }
    });

});

app.post('/room/create', function (req, res, next) {
    req.body.lastUpdated = new Date();
    let instance = new room(req.body);
    instance.save(function (err, room) {
        result = err ? err : room;
        res.send(result);
        // router.notifyclients();
        return result;
    });
});

io.on("connection", socket => {
    socket.on("newMessage", message => {
        console.log("the message ", message)
    })
});

// /* Notify chat messages to connected clients */
// router.clients = [];
// router.addClient = function (client) {
//     router.clients.push(client);
//     router.notifyclients(client);
// };
// router.notifyclients = function (client) {
//    chatMsg.find({}).exec(function (err, chats) {
//         if (err)
//             return console.error(err);
//         //console.log("Load success: ", chats);
//         var toNotify = client?new Array(client):router.clients;
//         toNotify.forEach(function(socket){
//             socket.emit('refresh', chats);
//         })
//     });
// };


//
// //export the router
// module.exports = router;