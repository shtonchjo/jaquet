// launche express server - npm install express --save
var express = require('express');
var app = express();
var server = app.listen(3000);
app.use(express.static("public"))
console.log("My socket server is running")

// launch socket - npm install socket.io --save
var socket = require('socket.io');
var io = socket(server);
io.sockets.on('connection', newConnection);

function newConnection(socket){
    console.log('New connection: ' + socket.id)
}