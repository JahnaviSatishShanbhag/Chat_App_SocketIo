const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');

const socket = io();

//Get username and room from URL
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true,
});

// console.log(username,room);

//Join a room
socket.emit('joinRoom', ({ username, room }));

socket.on('roomUsers', ({ room, roomMembers }) => {
    outputRoom(room);
    outputRoomMembers(roomMembers);
});

//Message from server
socket.on('message', (message) => {
    console.log(message);
    outputMessage(message);

    //Scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

//Message submit
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    //Get message text
    const msg = e.target.elements.msg.value;

    //Emit message to server
    socket.emit('chatMessage', msg);

    //Clear input
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});

//Output message to DOM
function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username}<span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`;
    document.querySelector('.chat-messages').appendChild(div);
}

function outputRoom(room) {
    const roomName = document.getElementById('room-name');
    roomName.innerText = `${room}`;
}

function outputRoomMembers(roomMembers) {
    const users = document.getElementById('users');
    users.innerHTML='';
    roomMembers.forEach((user) => {
        const li = document.createElement('li');
        li.innerText = user.username;
        users.appendChild(li);
    });
}