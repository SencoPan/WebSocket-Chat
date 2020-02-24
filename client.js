const messageBox = document.getElementsByClassName('messages')[0];
const inputAuth = document.getElementsByTagName('input')[0];
const input = document.getElementsByTagName('input')[2];
const authBlock = document.getElementsByClassName('auth')[0];
const messageBlock = document.getElementsByClassName('message-sender')[0];
const userBlock = document.getElementsByClassName('user-heap')[0];

const createUser = async (info) => {
    const newUser = document.createElement('div');
    const name = document.createTextNode(`${info}`);

    newUser.className = 'user';

    newUser.insertAdjacentHTML('beforeend', `
            <p> </p>
    `);

    newUser.children[0].appendChild(name);

    return newUser;
};

const createMessage = async (info) => {
    const newMessage = document.createElement('div');

    const name = document.createTextNode(`${info.author}:`);
    const text = document.createTextNode(`${info.text}`);

    newMessage.className = 'message';

    newMessage.insertAdjacentHTML('beforeend', `
            <p class="name"> </p>
            <p ></p>
    `);

    newMessage.children[0].appendChild(name);
    newMessage.children[1].appendChild(text);

    return newMessage;
};

const addMessage = async (message) => {
    console.log('message added');
    const newMessage = await createMessage(message);
    messageBox.append(newMessage)
};

const addUser = async user => {
    console.log('User added', user);
    const newUser = await createUser(user);
    userBlock.append(newUser);
};

const HOST = location.origin.replace(/^http/, 'ws');
window.WebSocket = window.WebSocket || window.MozWebSocket;

if (!window.WebSocket) {
    messageBox.innerHTML = '<p class="message"> Sorry, but your browser doesn\'t</p>';
    input.style.display = 'none';

} else {
    let user = false;
    let connection = new WebSocket(HOST);

    connection.onopen = async () => {
        console.log('User connected')
    };

    connection.onerror = async (error) => {
        connection.close();
    };

    connection.onclose = async () => {
        console.log('User disconnected')
    };

    connection.onmessage = async (receivedMessage) => {
        const message =  JSON.parse(receivedMessage.data);

        message ? true : console.error('Bad message');

        if (message.type === 'name') {
            await addUser(message.data)
        }

        if(message.type === 'message'){
            await addMessage(message)
        }
    };

    inputAuth.onkeypress = async event => {
        if (event.keyCode === 13 && inputAuth.value) {
            if (inputAuth.value.length > 15)
                inputAuth.setCustomValidity('Слишком большое имя.');
            else {
                user = inputAuth.value;

                await connection.send(user);

                authBlock.style.display = 'none';
                messageBlock.style.display = 'flex';
            }
        }
    };

    input.onkeypress = async event => {
        if (event.keyCode === 13 && input.value) {
            await connection.send(input.value);

            input.value = '';
        }
    };
}