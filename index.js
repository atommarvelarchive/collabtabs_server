var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname + '/public'));

// usernames which are currently connected to the chat
var usernames = {};
var numUsers = 0;

function isRecent(recent, attempt){
    if(recent.url === attempt.url && recent.index === attempt.index){
        return true;
    }
    return false;
}

var collabWindow = {tabs: [], recentNew: {url:"", index:-1}, recentNav: {url:"", index:-1}};

function clearRecent(prop){
    setTimeout(function(){
        var cleared = {url: "", index: -1};
        collabWindow[prop] = cleared;
    }, 300);
}

io.on('connection', function (socket) {

  socket.on("new tab", function (data) {
        console.log("opened a new tab");
        console.log(data);
    if(!isRecent(collabWindow.recentNew, data) && !(/chrome-extension/.test(data.url))){
        collabWindow.recentNew = data;
        socket.broadcast.emit("new tab", data);
        clearRecent("recentNew");
    }
  });

  socket.on("tab navigation", function (data) {
    if(collabWindow.recentTab !== data.url && !isRecent(collabWindow.recentNav, data) && !(/chrome-extension/.test(data.url))){
        collabWindow.recentNav = data;
        console.log("navigate tab at index "+data.index+" to "+data.url);
        socket.broadcast.emit("tab navigation", data);
        clearRecent("recentNav");
    }
  });

  socket.on("remove tab", function (data) {
    console.log("remove tab at index "+data.index);
    socket.broadcast.emit("remove tab", data);
  });

/*
  var addedUser = false;
  // when the client emits 'new message', this listens and executes
  socket.on('new message', function (data) {
    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (username) {
    // we store the username in the socket session for this client
    socket.username = username;
    // add the client's username to the global list
    usernames[username] = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function () {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function () {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    // remove the username from global usernames list
    if (addedUser) {
      delete usernames[socket.username];
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
*/
});
