const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, roomUsers } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const botName = 'ChartCord bot';

//Set static folder
app.use(express.static(path.join(__dirname, 'public')));

//Run when client connects
io.on('connection', (socket) => {
    // console.log('New ws connection');

    socket.on('joinRoom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room);

        socket.join(user.room);

        //Welcome current user
        socket.emit('message', formatMessage(botName, 'Welcome to ChartCord!'));

        //Broadcast when a user connects(all except the current user)
        socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined the chat`));

        //General to all io.emit()

        //Send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            roomMembers: roomUsers(user.room),
        });
    });

    //Listen for chat message
    socket.on('chatMessage', (msg) => {
        const currentUser = getCurrentUser(socket.id);

        // console.log(msg);
        io.to(currentUser.room).emit('message', formatMessage(currentUser.username, msg));
    });

    //Runs when client disconnects
    socket.on('disconnect', () => {
        const removeUser = userLeave(socket.id);

        if (removeUser) {
            io.to(removeUser.room).emit('message', formatMessage(botName, `${removeUser.username} has left the chat`));

            //Send users and room info
            io.to(removeUser.room).emit('roomUsers', {
                room: removeUser.room,
                roomMembers: roomUsers(removeUser.room),
            });
        }

        // console.log(removeUser);
    });
});

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server running on the port ${PORT}`));